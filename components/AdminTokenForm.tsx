"use client";

import { FormEvent, useEffect, useState } from "react";

const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

type Status = "unknown" | "set" | "unset";

function hasAdminCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .some((cookie) => cookie.startsWith("admin_token="));
}

export default function AdminTokenForm() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<Status>("unknown");

  useEffect(() => {
    setStatus(hasAdminCookie() ? "set" : "unset");
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) return;

    document.cookie = `admin_token=${encodeURIComponent(
      trimmed
    )}; path=/; max-age=${ONE_WEEK_SECONDS}; sameSite=Strict`;
    setToken("");
    setStatus("set");
  };

  const clearToken = () => {
    document.cookie =
      "admin_token=; path=/; max-age=0; sameSite=Strict";
    setStatus("unset");
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        <label className="block text-sm" htmlFor="admin-token">
          Paste your <code>ADMIN_TOKEN</code>
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="admin-token"
            type="password"
            autoComplete="off"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="••••••••••"
            className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2"
          />
          <button
            type="submit"
            className="rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-cyan-200 hover:bg-cyan-400/20 transition"
          >
            Save token
          </button>
        </div>
      </form>

      <div className="flex items-center justify-between text-sm text-zinc-400">
        <span>
          Status:{" "}
          <strong className="text-zinc-200">
            {status === "set" ? "token stored" : "no token"}
          </strong>
        </span>
        {status === "set" && (
          <button
            type="button"
            onClick={clearToken}
            className="rounded-lg border border-white/10 px-3 py-1 hover:bg-white/10 transition"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
