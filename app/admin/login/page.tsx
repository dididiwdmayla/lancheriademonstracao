"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/admin");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin");
    } catch (err: any) {
      console.error(err);
      setError("Email ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-marrom-900 flex items-center justify-center p-4 selection:bg-amarelo selection:text-marrom-900">
      <div className="w-full max-w-md bg-creme rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-amarelo" />
        
        <h1 className="font-display text-3xl text-marrom-900 italic uppercase mb-2">Painel Admin</h1>
        <p className="font-body text-marrom-600 mb-8 max-w-sm">
          Acesso restrito para funcionários da Ingarandi Burger.
        </p>

        {error && (
          <div className="bg-tomate/20 border border-tomate text-tomate p-3 rounded-xl text-sm font-bold mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-marrom-900 mb-1 tracking-widest uppercase text-xs">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-marrom-900/20 rounded-xl px-4 py-3 focus:outline-none focus:border-amarelo transition-colors bg-white font-body text-marrom-900"
              placeholder="funcionario@ingarandi.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-marrom-900 mb-1 tracking-widest uppercase text-xs">Senha</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-marrom-900/20 rounded-xl px-4 py-3 focus:outline-none focus:border-amarelo transition-colors bg-white font-body text-marrom-900"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className={`w-full font-bold tracking-widest uppercase py-4 mt-4 rounded-xl transition-all text-white shadow-lg ${
               loading ? "bg-marrom-600 opacity-70" : "bg-laranja hover:opacity-90"
            }`}
          >
            {loading ? "Entrando..." : "Acessar Painel"}
          </button>
        </form>
      </div>
    </main>
  );
}
