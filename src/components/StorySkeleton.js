import React from "react";

const StorySkeleton = () => (
  <div className="story-card animate-pulse">
    <div className="story-card-header">
      <div className="story-author-info">
        <div className="author-avatar-badge !bg-white/5" />
        <div className="space-y-2">
          <div className="h-4 w-32 rounded-full bg-white/5" />
          <div className="h-2.5 w-20 rounded-full bg-white/5" />
        </div>
      </div>
    </div>

    <div className="space-y-3 mb-[4vh] lg:mb-8">
      <div className="h-3.5 w-full rounded-full bg-white/5" />
      <div className="h-3.5 w-11/12 rounded-full bg-white/5" />
      <div className="h-3.5 w-2/3 rounded-full bg-white/5" />
    </div>

    <div className="flex items-center gap-4 border-t border-white/5 pt-[3vh] lg:pt-6">
      <div className="h-9 w-16 rounded-2xl bg-white/5" />
      <div className="h-9 w-16 rounded-2xl bg-white/5" />
      <div className="h-9 w-9 rounded-2xl bg-white/5 ml-auto" />
    </div>
  </div>
);

export default StorySkeleton;
