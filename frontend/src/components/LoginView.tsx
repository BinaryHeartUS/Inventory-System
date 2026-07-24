import { useState, type FormEvent } from "react";

const inputCls =
  "w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 outline-none " +
  "focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all bg-white";

export interface LoginViewProps {
  error: string | null;
  loading: boolean;
  onLogin: (username: string, password: string) => void;
}

export default function LoginView({ error, loading, onLogin }: LoginViewProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onLogin(username, password);
  }

  return (
    <div className="min-h-dvh bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/icon.png" alt="BinaryHeart" className="w-14 h-14 object-contain mb-3" />
          <span className="font-lato font-semibold text-xl tracking-tight">
            <span className="text-brand-red">Binary</span>
            <span className="text-heart-blue">Heart</span>
          </span>
          <p className="text-slate-400 text-sm mt-1">Inventory System</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
          <h1 className="text-lg font-bold text-slate-900 mb-6">Sign in</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 block">
                Username
              </label>
              <input
                type="text"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputCls}
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 block">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-heart-blue hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity mt-2"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
