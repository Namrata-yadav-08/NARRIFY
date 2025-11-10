import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function PostDetail(){
  const { id } = useParams();
  const nav = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load(){
      setLoading(true);
      try {
        const res = await api.get(`/posts/${id}`);
        setPost(res.data);
      } catch (err) {
        setError(err?.response?.data?.detail || err.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleDelete(){
    if (!confirm("Delete this post?")) return;
    try {
      await api.delete(`/posts/${id}`);
      nav("/dashboard");
    } catch (err) {
      alert("Delete failed: " + (err?.response?.data?.detail || err.message));
    }
  }

  const username = localStorage.getItem("username");

  if (loading) return <div className="text-gray-600">Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!post) return <div className="text-gray-600">Post not found</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <p className="text-sm text-gray-500 mb-4">by {post.author_username} • {new Date(post.created_at).toLocaleString()}</p>
      <div className="prose mb-6">{post.content}</div>
      <div className="flex gap-3">
        <Link to="/" className="px-3 py-1 border rounded">Back</Link>
        {post.author_username === username && (
          <>
            <Link to={`/posts/${post.id}/edit`} className="px-3 py-1 bg-yellow-500 text-white rounded">Edit</Link>
            <button onClick={handleDelete} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
          </>
        )}
      </div>
    </div>
  );
}
