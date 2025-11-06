"use client";

import { FormEvent, useEffect, useState } from "react";

const COOKIE_NAME = "admin_basic";
const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

type Status =
  | { state: "unknown" }
  | { state: "unset" }
  | { state: "set"; user: string };

function readStoredUser(): Status {
  if (typeof document === "undefined") return { state: "unknown" };

  const entry = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${COOKIE_NAME}=`));

  if (!entry) return { state: "unset" };

  const raw = entry.slice(COOKIE_NAME.length + 1);
  try {
    const decoded = Buffer.from(decodeURIComponent(raw), "base64").toString();
    const [user] = decoded.split(":");
    if (user) {
      return { state: "set", user };
    }
  } catch {
    // fall-through
  }

  return { state: "unset" };
}

export default function AdminCredentialsForm() {
  const [status, setStatus] = useState<Status>({ state: "unknown" });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setStatus(readStoredUser());
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const user = username.trim();
    const pass = password.trim();

    if (!user || !pass) return;

    const encoded = Buffer.from(`${user}:${pass}`).toString("base64");
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
      encoded
    )}; path=/; max-age=${ONE_WEEK_SECONDS}; sameSite=Strict`;

    setUsername("");
    setPassword("");
    setStatus({ state: "set", user });
  };

  const clearCredentials = () => {
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; sameSite=Strict`;
    setStatus({ state: "unset" });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-sm" htmlFor="admin-username">
          Store admin credentials (saved locally for 7 days)
        </label>

        <div className="grid gap-2 sm:grid-cols-2">
          <input
            id="admin-username"
            name="username"
            placeholder="Username"
            autoComplete="off"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="rounded-lg bg-white/5 border border-white/10 px-3 py-2"
          />
          <input
            id="admin-password"
            name="password"
            type="password"
            placeholder="Password"
            autoComplete="off"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-lg bg-white/5 border border-white/10 px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-cyan-200 hover:bg-cyan-400/20 transition"
        >
          Save credentials
        </button>
      </form>

      <div className="flex items-center justify-between text-sm text-zinc-400">
        <span>
          Status:{" "}
          <strong className="text-zinc-200">
            {status.state === "set"
              ? `stored for ${status.user}`
              : status.state === "unset"
              ? "no credentials"
              : "…"}
          </strong>
        </span>
        {status.state === "set" && (
          <button
            type="button"
            onClick={clearCredentials}
            className="rounded-lg border border-white/10 px-3 py-1 hover:bg-white/10 transition"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
