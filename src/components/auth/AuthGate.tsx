"use client";

/**
 * AuthGate — portão de autenticação. Enquanto não houver sessão, mostra o
 * login; logado, libera o app. Bloqueia acesso anônimo aos dados (junto com as
 * policies de RLS que exigem usuário autenticado).
 */

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-ink-soft">
        Carregando…
      </div>
    );
  }

  if (!session) return <LoginForm />;

  return (
    <>
      {children}
      <button
        onClick={() => supabase.auth.signOut()}
        className="fixed bottom-4 left-4 z-50 rounded-lg border border-ink/30 bg-card px-3 py-1.5 text-sm text-ink-soft shadow-sm transition hover:text-ink"
        title="Sair da conta"
      >
        Sair
      </button>
    </>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError("E-mail ou senha incorretos.");
    setBusy(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="grimoire-card w-full max-w-sm p-8"
      >
        <h1 className="page-title mb-1 text-4xl font-bold">Commonplace</h1>
        <p className="mb-6 text-sm text-ink-soft">
          Entre para acessar seu caderno.
        </p>

        <label className="mb-3 block">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            E-mail
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="grimoire-input mt-1 w-full"
          />
        </label>
        <label className="mb-4 block">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Senha
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="grimoire-input mt-1 w-full"
          />
        </label>

        {error && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-paper transition hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
