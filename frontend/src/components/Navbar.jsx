import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar(){
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [username, setUsername] = useState(localStorage.getItem("username"));

  useEffect(() => {
    function handleAuthChange() {
      setToken(localStorage.getItem("token"));
      setUsername(localStorage.getItem("username"));
    }
    window.addEventListener("authChanged", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("authChanged", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  function logout(){
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.dispatchEvent(new Event("authChanged"));
    navigate("/login");
  }
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="font-serif text-2xl font-bold">Narrify</Link>
        <div className="space-x-4 flex items-center">
          <a href="/#posts" className="text-sm px-3 py-1 rounded hover:bg-gray-100">Start reading</a>
          <Link to="/" className="text-sm">Home</Link>
          {token ? (
            <>
              <Link to="/dashboard" className="text-sm">My Posts</Link>
              <button onClick={logout} className="text-sm ml-2 px-3 py-1 bg-red-500 text-white rounded">Logout ({username})</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm">Login</Link>
              <Link to="/register" className="text-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
