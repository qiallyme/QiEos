import React from "react";
import AudioPlayer from "./AudioPlayer";

interface PostCardProps {
  post: {
    slug: string;
    title: string;
    date: string;
    category: string;
    summary?: string;
    audio?: string;
  };
}

const PostCard = ({ post }: PostCardProps) => {
  return (
    <article className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <header className="mb-4">
        <p className="text-sm text-gray-500">
          {new Date(post.date).toLocaleDateString()}
        </p>
        <h2 className="text-2xl font-bold mt-1">
          <a href={`/${post.slug}`} className="hover:text-blue-600">
            {post.title}
          </a>
        </h2>
      </header>
      {post.summary && <p className="text-gray-700 mb-4">{post.summary}</p>}
      {post.audio && <AudioPlayer src={post.audio} />}
      <a href={`/${post.slug}`} className="text-blue-600 font-semibold">
        {post.audio ? "Listen / Read More" : "Read More"} &rarr;
      </a>
    </article>
  );
};

export default PostCard;
