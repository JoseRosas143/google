"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Users, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  LogOut, 
  Lock, 
  RefreshCw,
  ExternalLink,
  PlusCircle,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Edit3,
  Save,
  Package,
  Layers,
  Globe,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface CampaignPageItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  hero_badge: string;
  hero_image_url?: string;
  referral_url: string;
  referral_btn_text: string;
  referral_btn_image_url?: string;
  status: string;
  created_at: string;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  country: string;
  message: string;
  status: string;
  campaign_slug: string;
  created_at: string;
}

interface PromoCode {
  id: string;
  code_ciphertext: string;
  territory: string;
  status: string;
  notes: string;
  campaign_slug?: string;
  created_at: string;
}

interface PlanItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  description: string;
  campaign_slug?: string;
  features: string[];
}

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pages" | "codes" | "leads" | "plans" | "cms">("pages");

  // Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Datos
  const [campaigns, setCampaigns] = useState<CampaignPageItem[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [clicksCount, setClicksCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);
  const [revealedCodes, setRevealedCodes] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Formulario: Crear Nueva Página / Campaña
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [newPageData, setNewPageData] = useState({
    slug: "",
    title: "",
    subtitle: "",
    hero_badge: "Solución Cloud Empresarial",
    hero_image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    referral_url: "",
    referral_btn_text: "Comenzar Registro Oficial",
    referral_btn_image_url: "",
    benefitsText: "Implementación rápida con tu dominio, Almacenamiento seguro en la nube, Soporte técnico estratégico"
  });

  // Formulario: Nuevo Código
  const [showAddCodeModal, setShowAddCodeModal] = useState(false);
  const [newCodeData, setNewCodeData] = useState({
    code: "",
    campaign_slug: "google-workspace",
    territory: "América",
    notes: "Inventario cargado desde Admin"
  });

  // Formulario: Nuevo Plan
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [newPlanData, setNewPlanData] = useState({
    name: "",
    campaign_slug: "google-workspace",
    price: 10,
    currency: "USD",
    description: "",
    featuresText: "Soporte 24/7, Espacio ilimitado, Múltiples usuarios"
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setAuthLoading(false);
      if (session) fetchAllData();
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchAllData();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchAllData = async () => {
    setDataLoading(true);
    try {
      // 1. Páginas / Campañas
      const { data: campData } = await supabase
        .from("campaign_pages")
        .select("*")
        .order("created_at", { ascending: false });
      if (campData) setCampaigns(campData);

      // 2. Prospectos
      const { data: leadsData } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (leadsData) setLeads(leadsData);

      // 3. Códigos
      const { data: codesData } = await supabase
        .from("promotion_codes")
        .select("*")
        .order("created_at", { ascending: true });
      if (codesData) setCodes(codesData);

      // 4. Planes
      const { data: plansData } = await supabase
        .from("plans")
        .select("*")
        .order("price", { ascending: true });
      if (plansData) {
        setPlans(plansData.map(p => ({
          ...p,
          features: Array.isArray(p.features) ? p.features : []
        })));
      }

      // 5. Clics
      const { count } = await supabase
        .from("analytics_events")
        .select("*", { count: "exact", head: true });
      setClicksCount(count || 0);

    } catch (err) {
      console.error(err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError(error.message);
    else setSession(data.session);
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // ===================== CREAR PÁGINA / CAMPAÑA =====================
  const handleAddPageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanSlug = newPageData.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-");
      const benefitsArr = newPageData.benefitsText.split(",").map((b, i) => ({
        title: `Beneficio ${i + 1}`,
        desc: b.trim()
      }));

      const { data, error } = await supabase
        .from("campaign_pages")
        .insert([
          {
            slug: cleanSlug,
            title: newPageData.title,
            subtitle: newPageData.subtitle,
            hero_badge: newPageData.hero_badge,
            hero_image_url: newPageData.hero_image_url,
            referral_url: newPageData.referral_url,
            referral_btn_text: newPageData.referral_btn_text,
            referral_btn_image_url: newPageData.referral_btn_image_url || null,
            benefits: benefitsArr,
            status: "active"
          }
        ])
        .select();

      if (error) throw error;
      if (data) {
        setCampaigns([data[0], ...campaigns]);
        setShowAddPageModal(false);
        setNewPageData({
          slug: "",
          title: "",
          subtitle: "",
          hero_badge: "Solución Cloud Empresarial",
          hero_image_url: "",
          referral_url: "",
          referral_btn_text: "Comenzar Registro Oficial",
          referral_btn_image_url: "",
          benefitsText: ""
        });
        notifyMessage(`Página creada con éxito en /c/${cleanSlug}`);
      }
    } catch (err: any) {
      alert("Error al crear página: " + err.message);
    }
  };

  const handleDeletePage = async (id: string, slug: string) => {
    if (!confirm(`¿Eliminar la página /c/${slug}?`)) return;
    try {
      const { error } = await supabase.from("campaign_pages").delete().eq("id", id);
      if (!error) {
        setCampaigns(campaigns.filter(c => c.id !== id));
        notifyMessage("Página eliminada.");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ===================== OPERACIONES DE CÓDIGOS =====================
  const handleToggleCodeStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "available" ? "redeemed" : "available";
    try {
      const { error } = await supabase
        .from("promotion_codes")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (!error) {
        setCodes(codes.map(c => c.id === id ? { ...c, status: newStatus } : c));
        notifyMessage(`Estado actualizado a: ${newStatus}`);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCode = async (id: string) => {
    if (!confirm("¿Eliminar este código?")) return;
    try {
      const { error } = await supabase.from("promotion_codes").delete().eq("id", id);
      if (!error) {
        setCodes(codes.filter(c => c.id !== id));
        notifyMessage("Código eliminado.");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from("promotion_codes")
        .insert([
          {
            code_ciphertext: newCodeData.code.trim().toUpperCase(),
            campaign_slug: newCodeData.campaign_slug,
            territory: newCodeData.territory,
            status: "available",
            notes: newCodeData.notes
          }
        ])
        .select();

      if (error) throw error;
      if (data) {
        setCodes([...codes, data[0]]);
        setShowAddCodeModal(false);
        setNewCodeData({ code: "", campaign_slug: "google-workspace", territory: "América", notes: "Inventario cargado" });
        notifyMessage("Código agregado a la bóveda.");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ===================== OPERACIONES PLANES =====================
  const handleAddPlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = newPlanData.name.toLowerCase().replace(/\s+/g, "-");
      const featuresArr = newPlanData.featuresText.split(",").map(f => f.trim());

      const { data, error } = await supabase
        .from("plans")
        .insert([
          {
            name: newPlanData.name,
            slug,
            campaign_slug: newPlanData.campaign_slug,
            price: Number(newPlanData.price),
            currency: newPlanData.currency,
            description: newPlanData.description,
            features: featuresArr
          }
        ])
        .select();

      if (error) throw error;
      if (data) {
        setPlans([...plans, { ...data[0], features: featuresArr }]);
        setShowAddPlanModal(false);
        setNewPlanData({ name: "", campaign_slug: "google-workspace", price: 10, currency: "USD", description: "", featuresText: "" });
        notifyMessage("Plan agregado a la campaña.");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm("¿Eliminar este plan?")) return;
    try {
      const { error } = await supabase.from("plans").delete().eq("id", id);
      if (!error) {
        setPlans(plans.filter(p => p.id !== id));
        notifyMessage("Plan eliminado.");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const notifyMessage = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const toggleReveal = (id: string) => setRevealedCodes(prev => ({ ...prev, [id]: !prev[id] }));
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

  // LOGIN
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-blue-600/20 border border-blue-500/40 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-white">Panel Administrativo</h1>
            <p className="text-xs text-slate-400 mt-2">J R Consulting — Consola de Control Multicampaña</p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-900/40 border border-red-700/60 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Correo Electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jrconsulting.com.mx"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg disabled:opacity-50"
            >
              {loginLoading ? "Verificando..." : "Iniciar Sesión"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const availableCodes = codes.filter(c => c.status === "available").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* HEADER */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm">JR</div>
            <div>
              <h2 className="font-bold text-sm text-white">Consola Multiprograma & Campañas</h2>
              <span className="text-[11px] text-slate-400 font-mono">{session.user.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {actionMessage && (
              <span className="hidden sm:inline-block px-3 py-1 bg-emerald-900/60 border border-emerald-700 text-emerald-300 text-xs rounded-full">
                ✓ {actionMessage}
              </span>
            )}
            <button onClick={fetchAllData} disabled={dataLoading} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs">
              <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? "animate-spin" : ""}`} />
            </button>
            <a href="/" target="_blank" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5">
              <span>Landing Principal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-800/60 border border-red-700/60 text-red-200 text-xs flex items-center gap-1.5">
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* TABS */}
      <div className="bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab("pages")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "pages" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <Globe className="w-4 h-4" /> Páginas / Campañas ({campaigns.length})
          </button>
          <button
            onClick={() => setActiveTab("codes")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "codes" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Bóveda de Códigos ({codes.length})
          </button>
          <button
            onClick={() => setActiveTab("plans")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "plans" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <Package className="w-4 h-4" /> Productos & Planes ({plans.length})
          </button>
          <button
            onClick={() => setActiveTab("leads")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "leads" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" /> CRM Prospectos ({leads.length})
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* ===================== TAB 1: PÁGINAS & CAMPAÑAS ===================== */}
        {activeTab === "pages" && (
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-400" /> Creador de Páginas y Campañas Comerciales
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Genera landings personalizadas con enlaces de referido, imágenes y contenido propio en segundos.
                </p>
              </div>
              <button
                onClick={() => setShowAddPageModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md self-start sm:self-auto"
              >
                <PlusCircle className="w-4 h-4" /> Crear Nueva Página
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((camp) => (
                <div key={camp.id} className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
                  {camp.hero_image_url && (
                    <img src={camp.hero_image_url} alt={camp.title} className="w-full h-36 object-cover" />
                  )}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                        /c/{camp.slug}
                      </span>
                      <span className="text-xs text-emerald-400 font-semibold">{camp.status}</span>
                    </div>
                    <h4 className="font-bold text-base text-white line-clamp-1">{camp.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{camp.subtitle}</p>
                    
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Enlace de Referido Asignado</span>
                      <p className="text-xs text-blue-400 font-mono truncate">{camp.referral_url}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex items-center justify-between">
                    <a
                      href={`/c/${camp.slug}`}
                      target="_blank"
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                    >
                      <span>Ver Página en Vivo</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    {camp.slug !== "google-workspace" && (
                      <button
                        onClick={() => handleDeletePage(camp.id, camp.slug)}
                        className="text-red-400 hover:text-red-300 text-xs p-1"
                        title="Eliminar página"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB 2: CÓDIGOS ===================== */}
        {activeTab === "codes" && (
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" /> Bóveda de Códigos Promocionales
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Asigna cupones a cada campaña y márcalos como usados.</p>
              </div>
              <button
                onClick={() => setShowAddCodeModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md"
              >
                <PlusCircle className="w-4 h-4" /> Agregar Código
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-950/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Campaña / Página</th>
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-4">Notas / Territorio</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-xs">
                  {codes.map((c) => {
                    const isRevealed = revealedCodes[c.id];
                    const masked = `${c.code_ciphertext.slice(0, 4)}••••••••${c.code_ciphertext.slice(-2)}`;
                    const isAvailable = c.status === "available";

                    return (
                      <tr key={c.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-sans text-blue-400">/c/{c.campaign_slug || "google-workspace"}</td>
                        <td className="py-3 px-4 tracking-wider text-amber-300 font-bold">
                          {isRevealed ? c.code_ciphertext : masked}
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-400">{c.notes} ({c.territory})</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-sans ${
                            isAvailable ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800" : "bg-red-950/80 text-red-400 border border-red-800"
                          }`}>
                            {isAvailable ? "Disponible" : "Usado"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1 font-sans">
                          <button onClick={() => toggleReveal(c.id)} className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => copyToClipboard(c.code_ciphertext, c.id)} className="p-1.5 rounded-lg bg-blue-600 text-white">
                            {copiedId === c.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleToggleCodeStatus(c.id, c.status)}
                            className={`p-1.5 rounded-lg text-white ${isAvailable ? "bg-amber-600" : "bg-emerald-600"}`}
                            title={isAvailable ? "Marcar como Usado" : "Revertir"}
                          >
                            {isAvailable ? <CheckCircle2 className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => handleDeleteCode(c.id)} className="p-1.5 rounded-lg bg-red-900/60 text-red-200">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== TAB 3: PLANES ===================== */}
        {activeTab === "plans" && (
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-400" /> Planes y Productos por Campaña
                </h3>
                <p className="text-xs text-slate-400">Asocia ediciones de software con precios a cada una de tus páginas.</p>
              </div>
              <button
                onClick={() => setShowAddPlanModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md"
              >
                <PlusCircle className="w-4 h-4" /> Agregar Plan
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((p) => (
                <div key={p.id} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-base text-white">{p.name}</h4>
                      <span className="text-xs px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 rounded-full font-mono">
                        /c/{p.campaign_slug || "workspace"}
                      </span>
                    </div>
                    <div className="text-2xl font-black text-slate-100">
                      ${p.price} <span className="text-xs text-slate-400 font-normal">/ {p.currency} / mes</span>
                    </div>
                    <p className="text-xs text-slate-400">{p.description || "Sin descripción"}</p>
                    <ul className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-slate-800">
                      {p.features?.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-800 flex justify-end">
                    <button onClick={() => handleDeletePlan(p.id)} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" /> Eliminar Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB 4: CRM PROSPECTOS ===================== */}
        {activeTab === "leads" && (
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" /> Solicitudes de Descuento Recibidas (CRM Multicampaña)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-950/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Página de Origen</th>
                    <th className="py-3 px-4">Prospecto</th>
                    <th className="py-3 px-4">Empresa</th>
                    <th className="py-3 px-4">Correo</th>
                    <th className="py-3 px-4">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {leads.map((ld) => (
                    <tr key={ld.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono text-slate-500">{new Date(ld.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-mono text-amber-400">/c/{ld.campaign_slug || "workspace"}</td>
                      <td className="py-3 px-4 font-semibold text-white">{ld.name}</td>
                      <td className="py-3 px-4">{ld.company} ({ld.country})</td>
                      <td className="py-3 px-4 text-blue-400 font-mono">{ld.email}</td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-400">{ld.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* MODAL: CREAR PÁGINA / CAMPAÑA */}
      {showAddPageModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Crear Nueva Página / Campaña Comercial</h3>
              <button onClick={() => setShowAddPageModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddPageSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Slug URL (Ruta)</label>
                  <div className="flex items-center bg-slate-800 rounded-xl px-3 border border-slate-700">
                    <span className="text-slate-500 font-mono">/c/</span>
                    <input
                      type="text"
                      required
                      placeholder="notion-ia"
                      value={newPageData.slug}
                      onChange={(e) => setNewPageData({ ...newPageData, slug: e.target.value })}
                      className="w-full py-2.5 bg-transparent text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Badge de Cabecera</label>
                  <input
                    type="text"
                    required
                    placeholder="Partner Oficial / Afiliado"
                    value={newPageData.hero_badge}
                    onChange={(e) => setNewPageData({ ...newPageData, hero_badge: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-semibold mb-1">Título Principal (H1)</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Optimiza tu productividad empresarial con Notion"
                  value={newPageData.title}
                  onChange={(e) => setNewPageData({ ...newPageData, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-semibold mb-1">Descripción / Subtítulo</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Texto comercial que explica la propuesta de valor del producto."
                  value={newPageData.subtitle}
                  onChange={(e) => setNewPageData({ ...newPageData, subtitle: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold uppercase text-amber-400">Enlace de Referido y Botón</span>
                <div>
                  <label className="block text-slate-400 mb-1">Enlace de Referido Exclusivo de este Producto</label>
                  <input
                    type="url"
                    required
                    placeholder="https://affiliate.service.com/ref/JR123"
                    value={newPageData.referral_url}
                    onChange={(e) => setNewPageData({ ...newPageData, referral_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Texto del Botón CTA</label>
                    <input
                      type="text"
                      value={newPageData.referral_btn_text}
                      onChange={(e) => setNewPageData({ ...newPageData, referral_btn_text: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">URL Imagen de Botón (Opcional)</label>
                    <input
                      type="url"
                      placeholder="https://.../button.png"
                      value={newPageData.referral_btn_image_url}
                      onChange={(e) => setNewPageData({ ...newPageData, referral_btn_image_url: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-semibold mb-1">URL Imagen del Hero</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newPageData.hero_image_url}
                  onChange={(e) => setNewPageData({ ...newPageData, hero_image_url: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-semibold mb-1">Beneficios Clave (separados por coma)</label>
                <textarea
                  rows={2}
                  placeholder="Centralización de proyectos, Automatizaciones con IA, Plantillas corporativas"
                  value={newPageData.benefitsText}
                  onChange={(e) => setNewPageData({ ...newPageData, benefitsText: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPageModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md"
                >
                  Publicar Página
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AGREGAR CÓDIGO */}
      {showAddCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">Registrar Código Promocional</h3>
            <form onSubmit={handleAddCodeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 uppercase font-semibold mb-1">Código</label>
                <input
                  type="text"
                  required
                  placeholder="PROMO2026"
                  value={newCodeData.code}
                  onChange={(e) => setNewCodeData({ ...newCodeData, code: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Página / Campaña</label>
                  <select
                    value={newCodeData.campaign_slug}
                    onChange={(e) => setNewCodeData({ ...newCodeData, campaign_slug: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    {campaigns.map(c => (
                      <option key={c.id} value={c.slug}>/c/{c.slug}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Territorio</label>
                  <input
                    type="text"
                    value={newCodeData.territory}
                    onChange={(e) => setNewCodeData({ ...newCodeData, territory: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 uppercase font-semibold mb-1">Notas</label>
                <input
                  type="text"
                  placeholder="Descuento 20% anual"
                  value={newCodeData.notes}
                  onChange={(e) => setNewCodeData({ ...newCodeData, notes: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddCodeModal(false)} className="px-4 py-2 bg-slate-800 rounded-xl text-slate-300">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 rounded-xl text-white font-bold">
                  Guardar Código
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AGREGAR PLAN */}
      {showAddPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">Crear Plan para una Campaña</h3>
            <form onSubmit={handleAddPlanSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 uppercase font-semibold mb-1">Nombre del Plan</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Plan Pro o Enterprise"
                  value={newPlanData.name}
                  onChange={(e) => setNewPlanData({ ...newPlanData, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Asignar a Página</label>
                  <select
                    value={newPlanData.campaign_slug}
                    onChange={(e) => setNewPlanData({ ...newPlanData, campaign_slug: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    {campaigns.map(c => (
                      <option key={c.id} value={c.slug}>/c/{c.slug}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Precio Mensual (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newPlanData.price}
                    onChange={(e) => setNewPlanData({ ...newPlanData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 uppercase font-semibold mb-1">Descripción</label>
                <input
                  type="text"
                  placeholder="Para equipos en crecimiento"
                  value={newPlanData.description}
                  onChange={(e) => setNewPlanData({ ...newPlanData, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 uppercase font-semibold mb-1">Características (separadas por coma)</label>
                <textarea
                  rows={2}
                  value={newPlanData.featuresText}
                  onChange={(e) => setNewPlanData({ ...newPlanData, featuresText: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddPlanModal(false)} className="px-4 py-2 bg-slate-800 rounded-xl text-slate-300">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 bg-purple-600 rounded-xl text-white font-bold">
                  Guardar Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
