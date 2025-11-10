import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Login(){
  const [form, setForm] = useState({username:"", password:""});
  const [error, setError] = useState("");
  const nav = useNavigate();

  async function submit(e){
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("username", form.username);
      // notify other components (Navbar) about auth change
      window.dispatchEvent(new Event("authChanged"));
      nav("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      // show friendly error
      const msg = err?.response?.data?.detail || err.message || "Login failed";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  }

  return (
    <form onSubmit={submit} className="max-w-md mx-auto bg-white p-4 rounded shadow">
      <h2 className="text-xl mb-3">Login</h2>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      <input required placeholder="Username" value={form.username} onChange={e=>setForm({...form, username:e.target.value})} className="w-full p-2 mb-2 border rounded" />
      <input required type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} className="w-full p-2 mb-2 border rounded" />
      <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Login</button>
    </form>
  );
}
