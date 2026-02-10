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

const StoryContext = createContext();

export const useStories = () => useContext(StoryContext);

export const StoryProvider = ({ children }) => {
  const [stories, setStories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  // Inicializa filtros do localStorage se existirem
  const [filters, setFilters] = useState(() => {
    const savedFilters = localStorage.getItem("relatos_filters");
    return savedFilters
      ? JSON.parse(savedFilters)
      : { categories: [], showLiked: false };
  });

  // Ref para travar curtidas em andamento
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

    let query = supabase
      .from("relatos")
      .select(
        `
        *,
        users!relatos_id_users_fkey(id_users, nomeUser),
        curtidas:curtidas(count),
        comentarios(*)
      `,
      )
      .order("id_relatos", { ascending: false });

    if (filters.categories && filters.categories.length > 0) {
      query = query.in("nomeCategoria", filters.categories);
    }

    if (filters.showLiked) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Filtra relatos onde existe uma curtida do usuário atual
        // Usamos inner join implícito filtrando pela tabela curtidas
        query = query
          .not("curtidas", "is", null)
          .filter("curtidas.id_users", "eq", user.id);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching stories:", error);
    } else {
      const formattedStories = data.map((story) => {
        const isAnon = story.is_anonymous;
        const authorName = story.users?.nomeUser;

        return {
          ...story,
          id: story.id_relatos,
          content: story.descricao || story.descrição,
          category_name: story.nomeCategoria || "Geral",
          author_name: isAnon ? "Anônimo" : authorName || "Usuário",
          author_id: story.id_users,
          likes: story.curtidas?.[0]?.count || 0,
          comentarios: story.comentarios?.map((c) => ({
            ...c,
            id: c.id_comentarios,
            content: c.descricao || c.descrição,
          })),
        };
      });
      setStories(formattedStories);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchCategories();
    fetchStories();
  }, [fetchCategories, fetchStories]);

  // Salva filtros no localStorage sempre que mudarem
  useEffect(() => {
    localStorage.setItem("relatos_filters", JSON.stringify(filters));
  }, [filters]);

  const addStory = async (storyData) => {
    const { content, categoryName, is_anonymous } = storyData;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Must be logged in to post");

    const { error } = await supabase.from("relatos").insert([
      {
        descricao: content,
        nomeCategoria: categoryName,
        is_anonymous: is_anonymous,
        id_users: user.id,
      },
    ]);

    if (error) throw error;
    fetchStories();
  };

  const likeStory = async (storyId) => {
    if (processingLikes.current.has(storyId)) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    processingLikes.current.add(storyId);

    try {
      const { error: checkError } = await supabase
        .from("curtidas")
        .select("*", { count: "exact", head: true })
        .eq("id_relatos", storyId)
        .eq("id_users", user.id);

      if (checkError) throw checkError;

      const { data: likeData } = await supabase
        .from("curtidas")
        .select("*")
        .eq("id_relatos", storyId)
        .eq("id_users", user.id)
        .maybeSingle();

      if (likeData) {
        const { error: deleteError } = await supabase
          .from("curtidas")
          .delete()
          .eq("id_relatos", storyId)
          .eq("id_users", user.id);

        if (deleteError) throw deleteError;
      } else {
        const { error: insertError } = await supabase
          .from("curtidas")
          .insert([{ id_relatos: storyId, id_users: user.id }]);

        if (insertError && insertError.code !== "23505") throw insertError;
      }

      await fetchStories();
    } catch (error) {
      console.error("Erro ao curtir:", error);
    } finally {
      processingLikes.current.delete(storyId);
    }
  };

  const addComment = async (storyId, content) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in to comment");

    // Optimistic Update: Create a temporary comment object
    const newCommentTemp = {
      id_comentarios: Date.now(), // Temporary ID
      descricao: content,
      id_relatos: storyId,
      id_users: user.id,
      created_at: new Date().toISOString(),
      content: content, // For UI consistency
    };

    // Update local state instantly
    setStories((prevStories) =>
      prevStories.map((story) => {
        if (story.id === storyId) {
          return {
            ...story,
            comentarios: [...(story.comentarios || []), newCommentTemp],
          };
        }
        return story;
      }),
    );

    const { error } = await supabase.from("comentarios").insert([
      {
        descricao: content,
        id_relatos: storyId,
        id_users: user.id,
      },
    ]);

    if (error) {
      // If error, we might want to fetch stories again to revert or show correct state
      fetchStories();
      throw error;
    }

    // Refresh to get real IDs and sync with database
    fetchStories();
  };

  const deleteStory = async (storyId) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Você precisa estar logado para apagar.");

    const { error } = await supabase
      .from("relatos")
      .delete()
      .eq("id_relatos", storyId)
      .eq("id_users", user.id);

    if (error) throw error;

    setStories((prev) => prev.filter((story) => story.id !== storyId));
  };

  const getRandomStory = async () => {
    const { count } = await supabase
      .from("relatos")
      .select("*", { count: "exact", head: true });

    if (!count) return null;
    const randomIndex = Math.floor(Math.random() * count);

    const { data, error } = await supabase
      .from("relatos")
      .select(
        `
        *,
        users!relatos_id_users_fkey(id_users, nomeUser),
        curtidas:curtidas(count),
        comentarios(*)
      `,
      )
      .range(randomIndex, randomIndex)
      .single();

    if (error) return null;
    const isAnon = data.is_anonymous;
    const authorName = data.users?.nomeUser;

    return {
      ...data,
      id: data.id_relatos,
      content: data.descricao || data.descrição,
      category_name: data.nomeCategoria || "Geral",
      author_name: isAnon ? "Anônimo" : authorName || "Usuário",
      likes: data.curtidas?.[0]?.count || 0,
      comentarios: data.comentarios?.map((c) => ({
        ...c,
        id: c.id_comentarios,
        content: c.descricao || c.descrição,
      })),
    };
  };

  const filterByCategories = (categoriesArray) => {
    setFilters((prev) => ({ ...prev, categories: categoriesArray }));
  };

  const toggleLikedFilter = () => {
    setFilters((prev) => ({ ...prev, showLiked: !prev.showLiked }));
  };

  return (
    <StoryContext.Provider
      value={{
        stories,
        categories,
        loading,
        addStory,
        likeStory,
        addComment,
        deleteStory,
        getRandomStory,
        filterByCategories,
        toggleLikedFilter,
        filters,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
};
