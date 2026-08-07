import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { supabase } from "../lib/supabase";
import { CATEGORIES } from "../data/mockStories";
import { useToast } from "./ToastContext";

const StoryContext = createContext();

export const useStories = () => useContext(StoryContext);

// Coluna legada com acento existe em algumas linhas antigas do banco;
// centraliza o fallback aqui para não espalhar a mesma checagem pelo código.
const getDescricao = (row) => row.descricao || row.descrição;

// Select usado tanto no sorteio aleatório quanto na abertura de um relato
// específico (ex.: clique num relato do perfil) — ambos exibem o mesmo
// modal e precisam dos mesmos dados (autor, curtidas).
const STORY_DETAIL_SELECT = `
  *,
  users!relatos_id_users_fkey(id_users, nomeUser),
  curtidas:curtidas(count),
  curtidas_detalhada:curtidas(id_users)
`;

const formatStoryDetail = (rawStory, user) => {
  const hasUserLiked = user
    ? rawStory.curtidas_detalhada?.some((l) => l.id_users === user.id)
    : false;

  return {
    ...rawStory,
    id: rawStory.id_relatos,
    content: getDescricao(rawStory),
    category_name: rawStory.nomeCategoria || "Geral",
    author_name: rawStory.is_anonymous
      ? "Anônimo"
      : rawStory.users?.nomeUser || "Usuário",
    likes: rawStory.curtidas?.[0]?.count || 0,
    isLiked: hasUserLiked,
  };
};

const DEFAULT_FILTERS = { categories: [], showLiked: false };

const loadSavedFilters = () => {
  const savedFilters = localStorage.getItem("relatos_filters");
  if (!savedFilters) return DEFAULT_FILTERS;
  try {
    return JSON.parse(savedFilters);
  } catch (err) {
    console.error("Filtros salvos corrompidos, usando padrão:", err);
    localStorage.removeItem("relatos_filters");
    return DEFAULT_FILTERS;
  }
};

export const StoryProvider = ({ children }) => {
  const { toast } = useToast();
  const [stories, setStories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(loadSavedFilters);

  const [randomStoryModal, setRandomStoryModal] = useState({
    isOpen: false,
    story: null,
  });

  const processingLikes = useRef(new Set());

  const fetchCategories = useCallback(() => {
    const formattedCategories = CATEGORIES.map((cat) => ({
      id: cat,
      name: cat,
    }));
    setCategories(formattedCategories);
  }, []);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let query = supabase
        .from("relatos")
        .select(
          `
          *,
          users!relatos_id_users_fkey(id_users, nomeUser),
          curtidas:curtidas(count),
          comentarios(*),
          curtidas_detalhada:curtidas(id_users)
        `,
        )
        .order("id_relatos", { ascending: false });

      if (filters.categories && filters.categories.length > 0) {
        query = query.in("nomeCategoria", filters.categories);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching stories:", error);
      } else {
        let formattedStories = data.map((story) => {
          const isAnon = story.is_anonymous;
          const authorName = story.users?.nomeUser;
          const hasUserLiked = user
            ? story.curtidas_detalhada?.some((l) => l.id_users === user.id)
            : false;

          return {
            ...story,
            id: story.id_relatos,
            content: getDescricao(story),
            category_name: story.nomeCategoria || "Geral",
            author_name: isAnon ? "Anônimo" : authorName || "Usuário",
            author_id: story.id_users,
            likes: story.curtidas?.[0]?.count || 0,
            isLiked: hasUserLiked,
            comentarios: story.comentarios?.map((c) => ({
              ...c,
              id: c.id_comentarios,
              content: getDescricao(c),
              is_own: user ? c.id_users === user.id : false,
            })),
          };
        });

        if (filters.showLiked && user) {
          formattedStories = formattedStories.filter((s) => s.isLiked);
        }

        setStories(formattedStories);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // SET UP REAL-TIME SUBSCRIPTION
  useEffect(() => {
    // Escuta mudanças nos relatos (likes novos, relatos novos)
    const storiesSubscription = supabase
      .channel("realtime_stories")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "relatos" },
        () => {
          fetchStories();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "curtidas" },
        () => {
          fetchStories();
        },
      )
      .subscribe();

    // Escuta mudanças nos comentários específicamente
    const commentsSubscription = supabase
      .channel("realtime_comments")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comentarios" },
        () => {
          // Quando um comentário entra, atualizamos tudo para refletir na tela
          fetchStories();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(storiesSubscription);
      supabase.removeChannel(commentsSubscription);
    };
  }, [fetchStories]);

  useEffect(() => {
    fetchCategories();
    fetchStories();
  }, [fetchCategories, fetchStories]);

  useEffect(() => {
    localStorage.setItem("relatos_filters", JSON.stringify(filters));
  }, [filters]);

  const addStory = useCallback(async (storyData) => {
    const { content, categoryName, is_anonymous } = storyData;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in to post");

    // Enviar para o Activepieces (Telegram Webhook)
    try {
      const webhookUrl = process.env.REACT_APP_ACTIVEPIECES_WEBHOOK_URL;
      console.log("Tentando enviar para Activepieces. URL:", webhookUrl);

      if (webhookUrl) {
        fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            relato: content,
            categoria: categoryName,
            usuario: is_anonymous ? "Anônimo" : user.email || "Usuário",
            data: new Date().toLocaleString("pt-BR"),
          }),
        })
          .then((res) => console.log("Resposta do Activepieces:", res.status))
          .catch((err) =>
            console.error("Erro ao enviar para Activepieces:", err),
          );
      } else {
        console.warn(
          "Webhook URL não encontrada! Verifique seu .env ou variáveis do Vercel.",
        );
      }
    } catch (e) {
      console.error("Erro no fetch do Activepieces:", e);
    }

    const { error } = await supabase.from("relatos").insert([
      {
        descricao: content,
        nomeCategoria: categoryName,
        is_anonymous: is_anonymous,
        id_users: user.id,
      },
    ]);

    if (error) throw error;
    // Realtime will handle fetch
  }, []);

  const updateStory = useCallback(async (storyId, storyData) => {
    const { content, categoryName, is_anonymous } = storyData;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in to edit");

    // Enviar para o Activepieces (Telegram Webhook via PUT)
    try {
      const webhookUrl = process.env.REACT_APP_ACTIVEPIECES_WEBHOOK_URL;
      console.log("Tentando enviar PUT para Activepieces. URL:", webhookUrl);

      if (webhookUrl) {
        fetch(webhookUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: storyId,
            relato: content,
            categoria: categoryName,
            usuario: is_anonymous ? "Anônimo" : user.email || "Usuário",
            data_edicao: new Date().toLocaleString("pt-BR"),
            acao: "edicao",
          }),
        })
          .then((res) =>
            console.log("Resposta PUT do Activepieces:", res.status),
          )
          .catch((err) =>
            console.error("Erro ao enviar PUT para Activepieces:", err),
          );
      } else {
        console.warn("Webhook URL (PUT) não encontrada!");
      }
    } catch (e) {
      console.error("Erro no fetch PUT do Activepieces:", e);
    }

    const { error } = await supabase
      .from("relatos")
      .update({
        descricao: content,
        nomeCategoria: categoryName,
        is_anonymous: is_anonymous,
      })
      .eq("id_relatos", storyId)
      .eq("id_users", user.id);

    if (error) throw error;
  }, []);

  const likeStory = useCallback(async (storyId) => {
    if (processingLikes.current.has(storyId)) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    processingLikes.current.add(storyId);

    const applyLikeDelta = (isNowLiked) => {
      setRandomStoryModal((prev) =>
        prev.story?.id === storyId
          ? {
              ...prev,
              story: {
                ...prev.story,
                isLiked: isNowLiked,
                likes: (prev.story.likes || 0) + (isNowLiked ? 1 : -1),
              },
            }
          : prev,
      );
    };

    try {
      const { data: existingLike } = await supabase
        .from("curtidas")
        .select("*")
        .eq("id_relatos", storyId)
        .eq("id_users", user.id)
        .maybeSingle();

      if (existingLike) {
        await supabase
          .from("curtidas")
          .delete()
          .eq("id_relatos", storyId)
          .eq("id_users", user.id);
        applyLikeDelta(false);
      } else {
        await supabase
          .from("curtidas")
          .insert([{ id_relatos: storyId, id_users: user.id }]);
        applyLikeDelta(true);
      }
    } catch (error) {
      console.error("Error liking:", error);
    } finally {
      processingLikes.current.delete(storyId);
    }
  }, []);

  const addComment = useCallback(async (storyId, content) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in to comment");

    // Optimistic Update
    const newCommentTemp = {
      id_comentarios: Date.now(),
      descricao: content,
      id_relatos: storyId,
      id_users: user.id,
      created_at: new Date().toISOString(),
      content: content,
      is_own: true,
    };

    setStories((prev) =>
      prev.map((s) =>
        s.id === storyId
          ? { ...s, comentarios: [...(s.comentarios || []), newCommentTemp] }
          : s,
      ),
    );

    const { error } = await supabase
      .from("comentarios")
      .insert([{ descricao: content, id_relatos: storyId, id_users: user.id }]);

    if (error) {
      // Reverte o comentário otimista já que ele não foi salvo de fato
      setStories((prev) =>
        prev.map((s) =>
          s.id === storyId
            ? {
                ...s,
                comentarios: (s.comentarios || []).filter(
                  (c) => c.id_comentarios !== newCommentTemp.id_comentarios,
                ),
              }
            : s,
        ),
      );
      throw error;
    }
  }, []);

  const deleteStory = useCallback(async (storyId) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("relatos")
      .delete()
      .eq("id_relatos", storyId)
      .eq("id_users", user.id);

    if (error) throw error;
  }, []);

  const getRandomStory = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("relatos")
        .select(STORY_DETAIL_SELECT)
        .limit(30); // Puxamos 30 para ter mais variedade

      if (error) {
        console.error("Erro no sorteio:", error);
        return null;
      }

      if (!data || data.length === 0) return null;

      const rawStory = data[Math.floor(Math.random() * data.length)];
      return formatStoryDetail(rawStory, user);
    } catch (err) {
      console.error("Critical random story error:", err);
      return null;
    }
  }, []);

  const getStoryById = useCallback(async (storyId) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: rawStory, error } = await supabase
        .from("relatos")
        .select(STORY_DETAIL_SELECT)
        .eq("id_relatos", storyId)
        .maybeSingle();

      if (error || !rawStory) {
        console.error("Erro ao buscar relato:", error);
        return null;
      }

      return formatStoryDetail(rawStory, user);
    } catch (err) {
      console.error("Erro crítico ao buscar relato:", err);
      return null;
    }
  }, []);

  const openRandomStory = useCallback(async () => {
    // Abre o modal imediatamente com loading
    setRandomStoryModal({ isOpen: true, story: null });
    const story = await getRandomStory();
    if (story) {
      setRandomStoryModal({ isOpen: true, story });
    } else {
      // Se falhar, fecha para não travar
      setRandomStoryModal({ isOpen: false, story: null });
      toast(
        "Não foi possível encontrar um relato místico no momento.",
        "error",
      );
    }
  }, [getRandomStory, toast]);

  const openStory = useCallback(
    async (storyId) => {
      setRandomStoryModal({ isOpen: true, story: null });
      const story = await getStoryById(storyId);
      if (story) {
        setRandomStoryModal({ isOpen: true, story });
      } else {
        setRandomStoryModal({ isOpen: false, story: null });
        toast("Não foi possível abrir esse relato.", "error");
      }
    },
    [getStoryById, toast],
  );

  const closeRandomStory = useCallback(() => {
    setRandomStoryModal({ isOpen: false, story: null });
  }, []);

  const filterByCategories = useCallback(
    (cats) => setFilters((prev) => ({ ...prev, categories: cats })),
    [],
  );

  const toggleLikedFilter = useCallback(
    () => setFilters((prev) => ({ ...prev, showLiked: !prev.showLiked })),
    [],
  );

  return (
    <StoryContext.Provider
      value={{
        stories,
        categories,
        loading,
        addStory,
        updateStory,
        likeStory,
        addComment,
        deleteStory,
        getRandomStory,
        getStoryById,
        openRandomStory,
        openStory,
        closeRandomStory,
        randomStoryModal,
        filterByCategories,
        toggleLikedFilter,
        filters,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
};
