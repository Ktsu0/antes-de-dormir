import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../lib/supabase";
import { CATEGORIES } from "../data/mockStories"; // Keep categories for UI filters

const StoryContext = createContext();

export const useStories = () => useContext(StoryContext);

export const StoryProvider = ({ children }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ category: null });

  const fetchStories = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("relatos")
      .select(
        `
        *,
        users (name),
        curtidas (count),
        comentarios (
          id,
          content,
          created_at,
          user_id
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (filters.category) {
      query = query.eq("category", filters.category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching stories:", error);
    } else {
      // Map data to match UI expectations if necessary
      const formattedStories = data.map((story) => ({
        ...story,
        likes: story.curtidas[0]?.count || 0, // specific to how supabase returns count
        // If author is anonymous, we might need to handle that in the UI
      }));
      setStories(formattedStories);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const addStory = async (storyData) => {
    const { content, category, is_anonymous } = storyData;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Must be logged in to post");

    const { error } = await supabase.from("relatos").insert([
      {
        content,
        category,
        is_anonymous,
        user_id: user.id,
      },
    ]);

    if (error) throw error;
    fetchStories();
  };

  const likeStory = async (storyId) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return; // or handle auth required

    // Check if already liked? For now assume simple toggle or just insert
    // Ideally we check if it exists:
    const { data, error: checkError } = await supabase
      .from("curtidas")
      .select("id")
      .eq("story_id", storyId)
      .eq("user_id", user.id)
      .single();

    if (data) {
      // Unlike
      await supabase.from("curtidas").delete().eq("id", data.id);
    } else {
      // Like
      await supabase
        .from("curtidas")
        .insert([{ story_id: storyId, user_id: user.id }]);
    }

    fetchStories(); // Refresh to update counts
  };

  const addComment = async (storyId, content) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in to comment");

    const { error } = await supabase.from("comentarios").insert([
      {
        content,
        story_id: storyId,
        user_id: user.id,
      },
    ]);

    if (error) throw error;
    fetchStories();
  };

  const getRandomStory = async () => {
    // Supabase doesn't have a direct "random" function easily exposed without RPC
    // Simple approach: fetch count, pick random offset
    const { count } = await supabase
      .from("relatos")
      .select("*", { count: "exact", head: true });
    const randomIndex = Math.floor(Math.random() * count);

    const { data, error } = await supabase
      .from("relatos")
      .select(
        `
        *,
        users (name),
        curtidas (count),
        comentarios (
          id,
          content,
          created_at,
          user_id
        )
      `,
      )
      .range(randomIndex, randomIndex)
      .single();

    if (error) return null;
    return {
      ...data,
      likes: data.curtidas[0]?.count || 0,
    };
  };

  const filterByCategory = (category) => {
    setFilters((prev) => ({ ...prev, category }));
  };

  return (
    <StoryContext.Provider
      value={{
        stories,
        loading,
        addStory,
        likeStory,
        addComment,
        getRandomStory,
        filterByCategory,
        categories: CATEGORIES,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
};
