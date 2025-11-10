import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api";
import { Link } from "react-router-dom";

async function fetchPosts(search) {
  const q = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await api.get(`/posts${q}`);
  return res.data;
}

export default function Home(){
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const postsRef = useRef(null);
  const username = localStorage.getItem("username");

  // client-side "load more" state
  const [visibleCount, setVisibleCount] = useState(5);

  // debounce search input
  useEffect(() => {
    const t = setTimeout(()=> setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data = [], isLoading, refetch } = useQuery(
    ["posts", debounced],
    () => fetchPosts(debounced),
    { keepPreviousData: true }
  );

  function scrollToPosts(){
    if(postsRef.current) postsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-white py-20">
        {/* decorative floating shapes */}
        <div className="absolute left-10 top-6 w-28 h-28 rounded-full bg-amber-200 opacity-40 animate-float-slow blur-lg"></div>
        <div className="absolute right-12 top-24 w-20 h-20 rounded-full bg-pink-200 opacity-30 animate-float delay-1000 blur-md"></div>
        <div className="absolute -left-8 bottom-8 w-36 h-36 rounded-full bg-indigo-100 opacity-25 animate-float-slower blur-xl"></div>

        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h1 className="text-6xl md:text-7xl font-serif font-bold leading-tight mb-4 transform-gpu animate-hero-pop">
              Narrify
            </h1>
            <p className="text-lg text-gray-700 mb-6 max-w-xl">
              Human stories & ideas — a place to read, write, and deepen your understanding.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={scrollToPosts}
                className="px-6 py-3 bg-black text-white rounded-full shadow-lg hover:scale-105 transform transition duration-300"
              >
                Start reading
              </button>
              <Link to="/posts/new" className="px-4 py-2 border rounded text-sm hover:bg-gray-100">Write a post</Link>
            </div>
          </div>
          <div className="flex-1">
            {/* illustration / placeholder */}
            <div className="hero-card h-64 md:h-72 rounded-lg flex items-center justify-center transform transition hover:scale-102">
              <div className="hero-card-inner">
                <span className="hero-card-text">Read. Write. Share.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH + POSTS */}
      <section ref={postsRef} id="posts" className="container mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <div className="w-full md:w-1/2">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search posts by title or content..." className="w-full p-3 border rounded" />
          </div>
          <div className="ml-4 text-sm text-gray-500">{isLoading ? "Loading..." : `${data.length} posts`}</div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            // simple skeletons
            Array.from({length:3}).map((_,i)=>(<div key={i} className="bg-white p-6 rounded shadow animate-pulse"><div className="h-6 bg-gray-200 rounded w-1/3 mb-3"/><div className="h-4 bg-gray-200 rounded w-full mb-2"/><div className="h-4 bg-gray-200 rounded w-3/4"/></div>))
          ) : (
            // show only first visibleCount posts, Load more reveals more
            data.slice(0, visibleCount).map((p, i) => (
              <div
                key={p.id}
                className="bg-white p-6 rounded shadow hover:shadow-xl transition transform-gpu hover:-translate-y-1 hover:scale-102 card-entrance"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-semibold mb-1">{p.title}</h3>
                    <p className="text-sm text-gray-600">by {p.author_username} • {new Date(p.created_at).toLocaleDateString()}</p>
                  </div>
                  {/* show edit if author */}
                  {p.author_username === username && (
                    <div className="space-x-2">
                      <Link to={`/posts/${p.id}/edit`} className="text-sm px-3 py-1 bg-yellow-400 rounded">Edit</Link>
                    </div>
                  )}
                </div>
                <p className="mt-4 text-gray-700">{p.content.slice(0, 300)}{p.content.length>300?"...":""}</p>
                <div className="mt-3 flex justify-end">
                  <Link to={`/posts/${p.id}`} className="text-sm px-3 py-1 bg-blue-600 text-white rounded">View more</Link>
                </div>
              </div>
            ))
          )}
          {/* Load more button */}
          {!isLoading && data.length > visibleCount && (
            <div className="flex justify-center mt-6">
              <button onClick={() => setVisibleCount(vc => vc + 5)} className="px-4 py-2 bg-indigo-600 text-white rounded">Load more</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
