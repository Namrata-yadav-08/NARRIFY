import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function NewPost(){
  const [form, setForm] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    // if not logged in, redirect to login
    if (!localStorage.getItem("token")) {
      nav("/login");
    }
  }, [nav]);

  async function submit(e){
    e.preventDefault();
    setError("");
    // simple validation
    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/posts", form);
      console.log("Create post response:", res);
      setLoading(false);
      // notify other components and go to dashboard
      window.dispatchEvent(new Event("authChanged"));
      nav("/dashboard");
    } catch (err) {
      console.error("Create post failed:", err);
      // If 401, session invalid — clear and redirect to login with message
      const status = err?.response?.status;
      if (status === 401) {
        setError("Session expired — redirecting to login...");
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.dispatchEvent(new Event("authChanged"));
        setLoading(false);
        setTimeout(() => nav("/login"), 800);
        return;
      }
      const msg = err?.response?.data?.detail || err?.message || "Failed to create post";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-2xl mx-auto bg-white p-4 rounded shadow">
      <h2 className="text-xl mb-3">Create Post</h2>
      {error && <div className="mb-3 text-red-600">{error}</div>}
      <input required placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} className="w-full p-2 mb-2 border rounded" />
      <textarea required placeholder="Content" value={form.content} onChange={e=>setForm({...form, content:e.target.value})} className="w-full p-2 mb-2 border rounded h-40" />
      <button type="submit" disabled={loading} className={`px-3 py-2 text-white rounded ${loading ? "bg-gray-400" : "bg-green-600"}`}>
        {loading ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
