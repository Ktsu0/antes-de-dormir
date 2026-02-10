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
  const [filters, setFilters] = useState(() => {
    const savedFilters = localStorage.getItem("relatos_filters");
    return savedFilters
      ? JSON.parse(savedFilters)
      : { categories: [], showLiked: false };
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
            content: story.descricao || story.descrição,
            category_name: story.nomeCategoria || "Geral",
            author_name: isAnon ? "Anônimo" : authorName || "Usuário",
            author_id: story.id_users,
            likes: story.curtidas?.[0]?.count || 0,
            isLiked: hasUserLiked,
            comentarios: story.comentarios?.map((c) => ({
              ...c,
              id: c.id_comentarios,
              content: c.descricao || c.descrição,
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
    // Realtime will handle fetch
  };

  const likeStory = async (storyId) => {
    if (processingLikes.current.has(storyId)) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    processingLikes.current.add(storyId);

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
      } else {
        await supabase
          .from("curtidas")
          .insert([{ id_relatos: storyId, id_users: user.id }]);
      }
    } catch (error) {
      console.error("Error liking:", error);
    } finally {
      processingLikes.current.delete(storyId);
    }
  };

  const addComment = async (storyId, content) => {
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
    if (error) fetchStories();
  };

  const deleteStory = async (storyId) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("relatos")
      .delete()
      .eq("id_relatos", storyId)
      .eq("id_users", user.id);
  };

  const getRandomStory = async () => {
    const { data } = await supabase
      .from("relatos")
      .select("*, users(nomeUser)")
      .limit(10);
    if (!data) return null;
    const story = data[Math.floor(Math.random() * data.length)];
    return {
      ...story,
      content: story.descricao,
      author_name: story.is_anonymous
        ? "Anônimo"
        : story.users?.nomeUser || "Usuário",
    };
  };

  const filterByCategories = (cats) =>
    setFilters((prev) => ({ ...prev, categories: cats }));
  const toggleLikedFilter = () =>
    setFilters((prev) => ({ ...prev, showLiked: !prev.showLiked }));

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
