import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NewPost from "./pages/NewPost";
import EditPost from "./pages/EditPost";
import PostDetail from "./pages/PostDetail"; // new
import Navbar from "./components/Navbar";

function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/posts/:id" element={<PostDetail />} /> {/* new */}
          <Route
            path="/dashboard"
            element={<RequireAuth><Dashboard /></RequireAuth>}
          />
          <Route
            path="/posts/new"
            element={<RequireAuth><NewPost /></RequireAuth>}
          />
          <Route
            path="/posts/:id/edit"
            element={<RequireAuth><EditPost /></RequireAuth>}
          />
        </Routes>
      </div>
    </div>
  );
}
