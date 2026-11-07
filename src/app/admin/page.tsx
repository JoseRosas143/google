"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Users, 
  BarChart3, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  LogOut, 
  Lock, 
  RefreshCw,
  ExternalLink,
  PlusCircle,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  country: string;
  message: string;
  status: string;
  created_at: string;
}

interface PromoCode {
  id: string;
  code_ciphertext: string;
  territory: string;
  status: string;
  notes: string;
  assigned_lead_id: string | null;
  created_at: string;
}

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Estados de Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Estados de Datos Reales de Supabase
  const [leads, setLeads] = useState<Lead[]>([]);
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [clicksCount, setClicksCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);
  const [revealedCodes, setRevealedCodes] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Verificar sesión activa
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setAuthLoading(false);
      if (session) {
        fetchRealData();
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchRealData();
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cargar datos reales desde PostgreSQL
  const fetchRealData = async () => {
    setDataLoading(true);
    try {
      // 1. Obtener prospectos reales
      const { data: leadsData } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (leadsData) setLeads(leadsData);

      // 2. Obtener códigos reales
      const { data: codesData } = await supabase
        .from("promotion_codes")
        .select("*")
        .order("created_at", { ascending: true });
      if (codesData) setCodes(codesData);

      // 3. Contar clics reales
      const { count } = await supabase
        .from("analytics_events")
        .select("*", { count: "exact", head: true })
        .eq("event_name", "referral_click");
      setClicksCount(count || 0);

    } catch (err) {
      console.error("Error al cargar datos:", err);
    } finally {
      setDataLoading(false);
    }
  };

  // Iniciar Sesión con Supabase Auth
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoginError(error.message);
    } else {
      setSession(data.session);
    }
    setLoginLoading(false);
  };

  // Cerrar Sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // Actualizar estado de un prospecto en la base de datos
  const handleUpdateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", leadId);

      if (!error) {
        setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Revelar / Enmascarar código
  const toggleReveal = (id: string) => {
    setRevealedCodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Copiar código al portapapeles
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // PANTALLA DE LOGIN PROTEGIDA (Si no está autenticado)
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-blue-600/20 border border-blue-500/40 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-white">Panel Administrativo</h1>
            <p className="text-xs text-slate-400 mt-2">J R Consulting — Acceso Restringido</p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-900/40 border border-red-700/60 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jrconsulting.com.mx"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
            >
              {loginLoading ? "Verificando..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              ← Volver a la Landing Pública
            </a>
          </div>
        </div>
      </div>
    );
  }

  // CÁLCULOS DE DATOS REALES
  const availableCodesCount = codes.filter(c => c.status === "available").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* BARRA SUPERIOR ADMIN */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
              JR
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Panel Administrativo</h2>
              <span className="text-[11px] text-slate-400 font-mono">{session.user.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchRealData}
              disabled={dataLoading}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
              title="Refrescar datos de la BD"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            <a
              href="/"
              target="_blank"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5"
            >
              <span>Ver Web</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-800/60 border border-red-700/60 text-red-200 text-xs flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* CUERPO DEL PANEL */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* MÉTRICAS REALES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold">Clics Reales B9iH</span>
            <p className="text-3xl font-extrabold text-blue-400 mt-2">{clicksCount}</p>
          </div>
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold">Prospectos Reales</span>
            <p className="text-3xl font-extrabold text-amber-400 mt-2">{leads.length}</p>
          </div>
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold">Códigos Disponibles</span>
            <p className="text-3xl font-extrabold text-emerald-400 mt-2">{availableCodesCount} / {codes.length}</p>
          </div>
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold">Enlace Activo</span>
            <p className="text-xs font-mono text-slate-300 mt-3 truncate">referworkspace.app.goo.gl/B9iH</p>
          </div>
        </div>

        {/* CRM DE PROSPECTOS REALES (leads) */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" /> Solicitudes de Descuento Recibidas (Tabla: leads)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Prospectos reales capturados desde el formulario de la página web.</p>
            </div>
            <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300 font-mono">
              Total: {leads.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Nombre</th>
                  <th className="py-3 px-4">Empresa</th>
                  <th className="py-3 px-4">Correo</th>
                  <th className="py-3 px-4">Detalle</th>
                  <th className="py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No hay prospectos registrados aún en la tabla 'leads'.
                    </td>
                  </tr>
                ) : (
                  leads.map((ld) => (
                    <tr key={ld.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {new Date(ld.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">{ld.name}</td>
                      <td className="py-3 px-4">{ld.company} ({ld.country})</td>
                      <td className="py-3 px-4 text-blue-400 font-mono">{ld.email}</td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-400">{ld.message}</td>
                      <td className="py-3 px-4">
                        <select
                          value={ld.status}
                          onChange={(e) => handleUpdateLeadStatus(ld.id, e.target.value)}
                          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="new">Nuevo (new)</option>
                          <option value="contacted">Contactado</option>
                          <option value="qualified">Calificado</option>
                          <option value="code_assigned">Código Asignado</option>
                          <option value="closed">Cerrado</option>
                          <option value="not_eligible">No Elegible</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* BÓVEDA DE CÓDIGOS REALES (promotion_codes) */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" /> Bóveda de Códigos (Tabla: promotion_codes)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Inventario real protegido en Supabase para entrega individual.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Territorio</th>
                  <th className="py-3 px-4">Código Enmascarado</th>
                  <th className="py-3 px-4">Notas / Edición</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-xs">
                {codes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No hay códigos registrados en 'promotion_codes'. Cárgalos desde el SQL Editor de Supabase.
                    </td>
                  </tr>
                ) : (
                  codes.map((c) => {
                    const isRevealed = revealedCodes[c.id];
                    const masked = `${c.code_ciphertext.slice(0, 4)}••••••••${c.code_ciphertext.slice(-2)}`;
                    return (
                      <tr key={c.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-sans">{c.territory}</td>
                        <td className="py-3 px-4 tracking-wider text-amber-300 font-bold">
                          {isRevealed ? c.code_ciphertext : masked}
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-400">{c.notes || "—"}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-sans ${
                            c.status === "available" 
                              ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800" 
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2 font-sans">
                          <button
                            onClick={() => toggleReveal(c.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs inline-flex items-center gap-1"
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            {isRevealed ? "Ocultar" : "Revelar"}
                          </button>
                          <button
                            onClick={() => copyToClipboard(c.code_ciphertext, c.id)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs inline-flex items-center gap-1"
                          >
                            {copiedId === c.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedId === c.id ? "Copiado" : "Copiar"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
