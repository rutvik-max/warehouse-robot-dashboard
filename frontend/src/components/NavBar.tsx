// navbar code
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../state/useAuthStore";

export default function NavBar(): React.JSX.Element {
  // select only the parts we need from the store (avoids depending on non-existent fields)
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout?.();
    navigate("/");
  };

  // derive logged-in state from user (or any other store flag that actually exists)
  const isLoggedIn = Boolean(user && (user.name || user.email));

  return (
    <nav className="w-full bg-white border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link to={isLoggedIn ? "/dashboard" : "/"} className="font-bold text-lg">
          Warehouse Robots
        </Link>

        {isLoggedIn && (
          <>
            <Link to="/bots" className="text-sm text-gray-600 hover:text-gray-900">Bots</Link>
            <Link to="/tasks" className="text-sm text-gray-600 hover:text-gray-900">Allocate</Link>
            <Link to="/queue" className="text-sm text-gray-600 hover:text-gray-900">Queue</Link>
            <Link to="/analytics" className="text-sm text-gray-600 hover:text-gray-900">Analytics</Link>
            <Link to="/map" className="text-sm text-gray-600 hover:text-gray-900">Map</Link>
          </>
        )}
      </div>

      <div>
        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700">Hi, {user?.name ?? "Operator"}</span>
            <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">Logout</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/signup" className="text-sm text-indigo-600 hover:underline">Sign up</Link>
            <Link to="/" className="text-sm text-gray-600 hover:underline">Login</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
