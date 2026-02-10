import React, { useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { StoryProvider } from "./contexts/StoryContext";
import Header from "./components/Header";
import StoryList from "./components/StoryList";
import CreateStoryModal from "./components/CreateStoryModal";
import FloatingRandomButton from "./components/FloatingRandomButton";
import Layout from "./components/Layout";
import CategoryFilter from "./components/CategoryFilter";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <AuthProvider>
      <StoryProvider>
        <Layout>
          <div className="pb-20">
            <Header onOpenCreate={() => setIsModalOpen(true)} />

            <div className="max-w-[1920px] mx-auto px-6 lg:px-12 pt-40 grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Sidebar Left: Filters */}
              <aside className="hidden lg:block col-span-3 sticky top-28 h-fit space-y-8">
                <CategoryFilter />
              </aside>

              {/* Main Content: Story List */}
              <main className="col-span-1 lg:col-span-6 space-y-6">
                <StoryList />
              </main>
            </div>

            {isModalOpen && (
              <CreateStoryModal onClose={() => setIsModalOpen(false)} />
            )}
          </div>
        </Layout>
        <FloatingRandomButton />
      </StoryProvider>
    </AuthProvider>
  );
}

export default App;
