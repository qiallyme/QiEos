import React from "react";
import { loadPosts } from "./lib/posts";
import Header from "./components/Header";
import PostCard from "./components/PostCard";

function App() {
  const posts = loadPosts();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-6 py-12">
        <div className="space-y-8">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </main>
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-6 py-4 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} QSaysIt. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
