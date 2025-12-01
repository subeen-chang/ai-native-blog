"use client";

import { useState, useEffect } from "react";

interface LikeButtonProps {
  slug: string;
}

export default function LikeButton({ slug }: LikeButtonProps) {
  const [likes, setLikes] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchLikes();
    checkIfLiked();
  }, [slug]);

  const fetchLikes = async () => {
    try {
      const response = await fetch(`/api/likes/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setLikes(data.likes);
      }
    } catch (error) {
      console.error("Failed to fetch likes:", error);
    }
  };

  const checkIfLiked = () => {
    const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
    setIsLiked(likedPosts.includes(slug));
  };

  const handleLike = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const method = isLiked ? "DELETE" : "POST";
      const response = await fetch(`/api/likes/${slug}`, { method });

      if (response.ok) {
        const data = await response.json();
        setLikes(data.likes);
        setIsLiked(!isLiked);

        // Update localStorage
        const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
        if (!isLiked) {
          likedPosts.push(slug);
        } else {
          const index = likedPosts.indexOf(slug);
          if (index > -1) {
            likedPosts.splice(index, 1);
          }
        }
        localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
      }
    } catch (error) {
      console.error("Failed to update like:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleLike}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
          isLiked
            ? "bg-red-100 text-red-600 hover:bg-red-200"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-label={isLiked ? "Unlike this post" : "Like this post"}
      >
        <svg
          className={`w-5 h-5 transition-transform ${isLiked ? "fill-current scale-110" : ""}`}
          fill={isLiked ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span className="font-medium">{likes}</span>
      </button>
    </div>
  );
}
