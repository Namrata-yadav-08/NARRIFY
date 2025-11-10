import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";

async function fetchMyPosts(){
  const res = await api.get("/posts/my");
  return res.data;
}

export default function Dashboard(){
  const qc = useQueryClient();
  const navigate = useNavigate();

  // useQuery with proper loading / error state
  const { data = [], isLoading, isError, error, refetch } = useQuery(["my-posts"], fetchMyPosts, {
    // do not run query if no token present
    enabled: !!localStorage.getItem("token")
  });

  // Delete mutation
  const del = useMutation(id => api.delete(`/posts/${id}`), {
    onSuccess: () => qc.invalidateQueries(["my-posts"])
  });

  // Re-fetch when auth changes (login/logout) so dashboard updates immediately
  useEffect(() => {
    function onAuth() {
      // refetch if token exists, otherwise clear (react-query will return empty because enabled false)
      if (localStorage.getItem("token")) {
        refetch();
      } else {
        qc.removeQueries(["my-posts"]);
      }
    }
    window.addEventListener("authChanged", onAuth);
    window.addEventListener("storage", onAuth);
    return () => {
      window.removeEventListener("authChanged", onAuth);
      window.removeEventListener("storage", onAuth);
    };
  }, [qc, refetch]);

  const username = localStorage.getItem("username");

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl">My Posts</h2>
        <button onClick={() => navigate("/posts/new")} className="px-3 py-1 bg-green-600 text-white rounded">New Post</button>
      </div>

      {isLoading && <div className="text-gray-500">Loading your posts...</div>}
      {isError && <div className="text-red-600">Error loading posts: {String(error?.message || error)}</div>}

      {!isLoading && data.length === 0 && (
        <div className="bg-white p-6 rounded shadow text-gray-600">
          <p className="mb-2">You haven't created any posts yet.</p>
          <p className="text-sm">Click <button onClick={()=>navigate("/posts/new")} className="text-blue-600 underline">New Post</button> to write your first article.</p>
        </div>
      )}

      <div className="space-y-4 mt-4">
        {data.map(p => (
          <div key={p.id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{p.title}</h3>
                <p className="text-sm text-gray-500">Created: {new Date(p.created_at).toLocaleString()}</p>
              </div>
              <div className="space-x-2">
                <Link to={`/posts/${p.id}/edit`} className="px-2 py-1 bg-yellow-500 text-white rounded">Edit</Link>
                <button onClick={() => del.mutate(p.id)} className="px-2 py-1 bg-red-600 text-white rounded">Delete</button>
              </div>
            </div>
            <p className="mt-2 text-gray-700">{p.content.slice(0, 250)}{p.content.length > 250 ? "..." : ""}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
