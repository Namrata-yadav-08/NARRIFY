import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";

export default function EditPost(){
  const { id } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", content: "" });
  const { data: myPosts = [] } = useQuery(["my-posts"], () => api.get("/posts/my").then(r => r.data));

  useEffect(() => {
    if (myPosts && myPosts.length) {
      const post = myPosts.find(p => String(p.id) === String(id));
      if (post) {
        setForm({ title: post.title, content: post.content });
      } else {
        // not found or not owner -> redirect
        nav("/dashboard");
      }
    }
  }, [myPosts, id, nav]);

  const update = useMutation(payload => api.put(`/posts/${id}`, payload), {
    onSuccess: () => {
      qc.invalidateQueries(["my-posts"]);
      qc.invalidateQueries(["posts"]);
      nav("/dashboard");
    }
  });

  function submit(e){
    e.preventDefault();
    update.mutate(form);
  }

  return (
    <form onSubmit={submit} className="max-w-2xl mx-auto bg-white p-4 rounded shadow">
      <h2 className="text-xl mb-3">Edit Post</h2>
      <input required placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} className="w-full p-2 mb-2 border rounded" />
      <textarea required placeholder="Content" value={form.content} onChange={e=>setForm({...form, content:e.target.value})} className="w-full p-2 mb-2 border rounded h-40" />
      <div className="flex space-x-2">
        <button className="px-3 py-2 bg-yellow-500 text-white rounded">Save</button>
        <button type="button" onClick={()=>nav("/dashboard")} className="px-3 py-2 bg-gray-300 rounded">Cancel</button>
      </div>
    </form>
  );
}
