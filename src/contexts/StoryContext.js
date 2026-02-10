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
  const [filters, setFilters] = useState({ category: null });

  // Ref para travar curtidas em andamento (evita re-render desnecessário)
  const processingLikes = useRef(new Set());

  // Load categories from local mock file (Static & Fast)
  const fetchCategories = useCallback(() => {
    const formattedCategories = CATEGORIES.map((cat, index) => ({
      id: cat,
      name: cat,
    }));
    setCategories(formattedCategories);
  }, []);

  const fetchStories = useCallback(async () => {
    setLoading(true);

    // Query ajustada: 'descricao' sem acento
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

    // Filter by text column directly
    if (filters.category) {
      query = query.eq("nomeCategoria", filters.category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching stories:", error);
    } else {
      const formattedStories = data.map((story) => ({
        ...story,
        id: story.id_relatos,
        // Usando 'descricao' sem acento do banco, fallback para 'descrição' se ainda existir antigo
        content: story.descricao || story.descrição,
        category_name: story.nomeCategoria || "Geral",
        author_name: story.users?.nomeUser || "Anônimo",
        author_id: story.id_users,
        likes: story.curtidas?.[0]?.count || 0,
        comentarios: story.comentarios?.map((c) => ({
          ...c,
          id: c.id_comentarios,
          content: c.descricao || c.descrição, // Ajuste aqui também
        })),
      }));
      setStories(formattedStories);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchCategories();
    fetchStories();
  }, [fetchCategories, fetchStories]);

  const addStory = async (storyData) => {
    const { content, categoryName, is_anonymous } = storyData;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Must be logged in to post");

    // Ajuste: 'descricao' sem acento
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
    // 1. Trava de segurança (Debounce/Lock)
    if (processingLikes.current.has(storyId)) {
      console.log(`Curtida para ${storyId} já em processamento.`);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Adiciona trava
    processingLikes.current.add(storyId);

    try {
      // 2. Verifica se existe (Sem pedir ID)
      const { error: checkError } = await supabase
        .from("curtidas")
        .select("*", { count: "exact", head: true }) // Apenas verifica existência
        .eq("id_relatos", storyId)
        .eq("id_users", user.id);

      if (checkError) throw checkError;

      // 'existingLike' será null com head:true, mas usamos 'count' ou logicamente o retorno do select se não fosse head.
      // Correção: head:true retorna null data, mas podemos usar maybeSingle sem head se quisermos dados,
      // ou count. Vamos usar maybeSingle() normal sem select ID para garantir.

      const { data: likeData } = await supabase
        .from("curtidas")
        .select("*") // Seleciona tudo (ou qualquer coluna leve)
        .eq("id_relatos", storyId)
        .eq("id_users", user.id)
        .maybeSingle();

      if (likeData) {
        // DELETE (Descurtir) usando Composite Key (id_users + id_relatos)
        const { error: deleteError } = await supabase
          .from("curtidas")
          .delete()
          .eq("id_relatos", storyId)
          .eq("id_users", user.id);

        if (deleteError) throw deleteError;
      } else {
        // INSERT (Curtir)
        const { error: insertError } = await supabase
          .from("curtidas")
          .insert([{ id_relatos: storyId, id_users: user.id }]);

        if (insertError) {
          // Ignora erro 409 (Conflict) se acontecer duplicidade concorrente
          if (insertError.code !== "23505") throw insertError;
        }
      }

      // Atualiza UI
      await fetchStories();
    } catch (error) {
      console.error("Erro ao curtir:", error);
    } finally {
      // Remove trava
      processingLikes.current.delete(storyId);
    }
  };

  const addComment = async (storyId, content) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in to comment");

    // Ajuste: 'descricao' sem acento
    const { error } = await supabase.from("comentarios").insert([
      {
        descricao: content,
        id_relatos: storyId,
        id_users: user.id,
      },
    ]);

    if (error) throw error;
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

    // Otimista: remove da lista local imediatamente
    setStories((prev) => prev.filter((story) => story.id !== storyId));
  };

  const getRandomStory = async () => {
    const { count } = await supabase
      .from("relatos")
      .select("*", { count: "exact", head: true });

    if (!count) return null;
    const randomIndex = Math.floor(Math.random() * count);

    // Ajuste: 'descricao' na query
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
    return {
      ...data,
      id: data.id_relatos,
      content: data.descricao || data.descrição, // Fallback
      category_name: data.nomeCategoria || "Geral",
      author_name: data.users?.nomeUser || "Anônimo",
      likes: data.curtidas?.[0]?.count || 0,
      comentarios: data.comentarios?.map((c) => ({
        ...c,
        id: c.id_comentarios,
        content: c.descricao || c.descrição,
      })),
    };
  };

  const filterByCategory = (categoryName) => {
    setFilters((prev) => ({ ...prev, category: categoryName }));
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
        filterByCategory,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
};
