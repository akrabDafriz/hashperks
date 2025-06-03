// frontend/app/(components)/auth/LoginForm.jsx
"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, LogIn, Mail, User } from "lucide-react";

export const LoginForm = ({ type, onLoginSuccess }) => {
  const { handleUserLogin, handleBusinessLogin, loading } = useAuth();
  const [identifier, setIdentifier] = useState(""); // username for user, email for business
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result =
      type === "user" ? await handleUserLogin(identifier, password) : await handleBusinessLogin(identifier, password);

    if (!result.success) {
      setError(result.error);
    } else {
      onLoginSuccess && onLoginSuccess(); // Callback for parent component
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-md text-sm">{error}</div>}
      <div>
        <label htmlFor={`${type}-identifier`} className="block text-sm font-medium text-slate-700 mb-1">
          {type === "user" ? "Username" : "Email"}
        </label>
        <div className="relative">
          <input
            type={type === "user" ? "text" : "email"}
            id={`${type}-identifier`}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={type === "user" ? "your_username" : "business@example.com"}
            required
            className="input-field-modern pl-10"
          />
          {type === "user" ? (
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          ) : (
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          )}
        </div>
      </div>
      <div>
        <label htmlFor={`${type}-password`} className="block text-sm font-medium text-slate-700 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            type="password"
            id={`${type}-password`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="input-field-modern pl-10"
          />
          <LogIn size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-primary-dark w-full flex justify-center items-center !py-3"
      >
        {loading ? <Loader2 size={20} className="animate-spin mr-2" /> : <LogIn size={18} className="mr-2" />}
        {type === "user" ? "Login as User" : "Login as Business"}
      </button>
    </form>
  );
};
