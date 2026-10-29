import React from "react";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-32 pb-16 space-y-8 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-48 rounded-3xl bg-neutral-200/80 dark:bg-neutral-800/80 w-full" />

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-96 rounded-3xl bg-neutral-200/60 dark:bg-neutral-800/60 border border-neutral-300/40 dark:border-neutral-700/40"
          />
        ))}
      </div>
    </div>
  );
}
