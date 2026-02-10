import React, { useState } from "react";
import { useStories } from "../contexts/StoryContext";
import { Sparkles } from "lucide-react";

const CategoryFilter = () => {
  const { categories, filterByCategory } = useStories();
  const [active, setActive] = useState(null);

  const handleFilter = (cat) => {
    if (active === cat) {
      setActive(null);
      filterByCategory(null);
    } else {
      setActive(cat);
      filterByCategory(cat);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
        Filtrar por Vibe
      </h2>
      <nav className="space-y-2">
        <button
          onClick={() => handleFilter(null)}
          className={`btn-mirror ${active === null ? "active" : ""}`}
        >
          <Sparkles
            className={`w-4 h-4 ${active === null ? "text-purple-400" : "text-zinc-500"}`}
          />
          🚀 Todos os Relatos
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleFilter(cat.id)}
            className={`btn-mirror ${active === cat.id ? "active" : ""}`}
          >
            <span className="truncate">{cat.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default CategoryFilter;
