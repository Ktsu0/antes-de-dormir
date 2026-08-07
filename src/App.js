import React, { useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { StoryProvider } from "./contexts/StoryContext";
import { ToastProvider } from "./contexts/ToastContext";
import Header from "./components/Header";
import StoryList from "./components/StoryList";
import CreateStoryModal from "./components/CreateStoryModal";
import FloatingRandomButton from "./components/FloatingRandomButton";
import Layout from "./components/Layout";
import CategoryFilter from "./components/CategoryFilter";
import RandomStoryModal from "./components/RandomStoryModal";
import ToastViewport from "./components/ToastViewport";
import ProfilePage from "./components/ProfilePage";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <ToastProvider>
      <AuthProvider>
        <StoryProvider>
          <Layout>
            <div className="pb-20">
              <Header
                onOpenCreate={() => setIsModalOpen(true)}
                onOpenProfile={() => setShowProfile(true)}
              />

              {showProfile ? (
                <ProfilePage onBack={() => setShowProfile(false)} />
              ) : (
                <div className="max-w-[1920px] mx-auto px-[5vw] lg:px-[8vw] pt-32 lg:pt-40 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-[4vw]">
                  <aside className="col-span-1 lg:col-span-3 lg:sticky lg:top-36 h-fit space-y-4 lg:space-y-8 z-20">
                    <CategoryFilter />
                  </aside>
                  <main className="col-span-1 lg:col-span-6 space-y-6">
                    <StoryList />
                  </main>
                </div>
              )}

              {isModalOpen && (
                <CreateStoryModal onClose={() => setIsModalOpen(false)} />
              )}
            </div>
          </Layout>
          <FloatingRandomButton />
          <RandomStoryModal />
        </StoryProvider>
      </AuthProvider>
      <ToastViewport />
    </ToastProvider>
  );
}

export default App;
