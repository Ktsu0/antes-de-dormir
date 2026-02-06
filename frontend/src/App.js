import React, { useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { StoryProvider } from "./contexts/StoryContext";
import Header from "./components/Header";
import StoryList from "./components/StoryList";
import CreateStoryModal from "./components/CreateStoryModal";
import FloatingRandomButton from "./components/FloatingRandomButton";
import Layout from "./components/Layout";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <AuthProvider>
      <StoryProvider>
        <Layout>
          <div className="pb-20">
            <Header onOpenCreate={() => setIsModalOpen(true)} />

            <main className="container mx-auto max-w-2xl px-4 pt-40 lg:pt-48">
              <StoryList />
            </main>

            <FloatingRandomButton />

            {isModalOpen && (
              <CreateStoryModal onClose={() => setIsModalOpen(false)} />
            )}
          </div>
        </Layout>
      </StoryProvider>
    </AuthProvider>
  );
}

export default App;
