import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Register(){
  const [form, setForm] = useState({username:"", email:"", password:""});
  const nav = useNavigate();
  async function submit(e){
    e.preventDefault();
    await api.post("/auth/register", form);
    nav("/login");
  }
  return (
    <form onSubmit={submit} className="max-w-md mx-auto bg-white p-4 rounded shadow">
      <h2 className="text-xl mb-3">Register</h2>
      <input required placeholder="Username" value={form.username} onChange={e=>setForm({...form, username:e.target.value})} className="w-full p-2 mb-2 border rounded" />
      <input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="w-full p-2 mb-2 border rounded" />
      <input required type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} className="w-full p-2 mb-2 border rounded" />
      <button className="px-3 py-2 bg-green-600 text-white rounded">Register</button>
    </form>
  );
}
