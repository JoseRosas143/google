"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  Building2, 
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Check,
  RefreshCw,
  Layers,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface CampaignPageData {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  hero_badge: string;
  hero_image_url?: string;
  referral_url: string;
  referral_btn_text: string;
  referral_btn_image_url?: string;
  contact_email: string;
  benefits?: Array<{ title: string; desc: string }>;
}

interface PlanItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
}

export default function DynamicCampaignPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "google-workspace";

  const [campaign, setCampaign] = useState<CampaignPageData | null>(null);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Estados del modal de prospecto
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [leadForm, setLeadForm] = useState({ name: "", email: "", company: "", country: "México", notes: "" });
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaignData = async () => {
      setLoading(true);
      try {
        const { data: pageData, error: pageErr } = await supabase
          .from("campaign_pages")
          .select("*")
          .eq("slug", slug)
          .eq("status", "active")
          .single();

        if (pageErr || !pageData) {
          setNotFound(true);
          return;
        }

        setCampaign(pageData);

        const { data: plansData } = await supabase
          .from("plans")
          .select("*")
          .eq("campaign_slug", slug)
          .order("price", { ascending: true });

        if (plansData && plansData.length > 0) {
          setPlans(plansData.map(p => ({
            ...p,
            features: Array.isArray(p.features) ? p.features : []
          })));
          setSelectedPlan(plansData[0].name);
        }
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignData();
  }, [slug]);

  const trackReferralClick = async () => {
    if (!campaign) return;
    try {
      await supabase.from("analytics_events").insert([
        {
          event_name: "referral_click",
          page_path: `/c/${slug}`,
          metadata: { target_url: campaign.referral_url, campaign_slug: slug }
        }
      ]);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLead(true);
    setLeadError(null);

    try {
      const { error } = await supabase.from("leads").insert([
        {
          name: leadForm.name,
          email: leadForm.email,
          company: leadForm.company,
          country: leadForm.country,
          campaign_slug: slug,
          message: `Campaña: ${slug} | Plan: ${selectedPlan}. Notas: ${leadForm.notes}`,
          status: "new"
        }
      ]);

      if (error) throw error;

      setLeadSent(true);
      setTimeout(() => {
        setLeadSent(false);
        setModalOpen(false);
        setLeadForm({ name: "", email: "", company: "", country: "México", notes: "" });
      }, 2500);
    } catch (err: any) {
      setLeadError(err.message || "Error al registrar la solicitud.");
    } finally {
      setSubmittingLead(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (notFound || !campaign) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <Layers className="w-16 h-16 text-slate-600 mb-4" />
        <h1 className="text-3xl font-bold">Página de Campaña no encontrada</h1>
        <p className="text-slate-400 mt-2 max-w-md">
          La campaña <code>/c/{slug}</code> no existe o se encuentra en borrador.
        </p>
        <a href="/" className="mt-6 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm">
          Ir al Inicio
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900 font-sans">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
              JR
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">J R CONSULTING</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                {campaign.hero_badge || "Partner Oficial"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://jrconsulting.com.mx"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm transition-all text-sm group"
            >
              <span>J R Consulting</span>
              <ExternalLink className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-blue-50/50 via-white to-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                  <Building2 className="w-3.5 h-3.5" />
                  {campaign.hero_badge}
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                  {campaign.title}
                </h1>

                <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                  {campaign.subtitle}
                </p>

                <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {campaign.referral_btn_image_url ? (
                    <a
                      href={campaign.referral_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={trackReferralClick}
                      className="inline-block transition-transform hover:scale-[1.03] active:scale-95 shadow-md rounded"
                    >
                      <img
                        src={campaign.referral_btn_image_url}
                        alt="Botón oficial"
                        className="h-12 w-auto max-w-full"
                        loading="lazy"
                      />
                    </a>
                  ) : (
                    <a
                      href={campaign.referral_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={trackReferralClick}
                      className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
                    >
                      <span>{campaign.referral_btn_text}</span>
                      <ExternalLink className="w-4 h-4 text-blue-400" />
                    </a>
                  )}

                  <button
                    onClick={() => setModalOpen(true)}
                    className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2"
                  >
                    <span>Consultar Descuento Disponible</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
                  <img
                    src={campaign.hero_image_url || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"}
                    alt={campaign.title}
                    className="w-full h-80 object-cover"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {campaign.benefits && campaign.benefits.length > 0 && (
          <section className="py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl font-extrabold text-slate-900">Aspectos Clave y Ventajas</h2>
                <p className="text-slate-600 mt-2 text-base">Beneficios destacados al implementar esta solución con J R Consulting.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {campaign.benefits.map((b, i) => (
                  <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-4">
                      {i + 1}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{b.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {plans.length > 0 && (
          <section className="py-20 bg-white border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  Ediciones y Planes
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900 mt-3">Planes Disponibles</h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {plans.map((p) => (
                  <div key={p.id} className="border border-slate-200 rounded-3xl p-8 bg-white flex flex-col justify-between hover:border-slate-300">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">{p.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">{p.description}</p>
                      
                      <div className="mt-6">
                        <span className="text-4xl font-extrabold text-slate-900">${p.price} {p.currency}</span>
                        <span className="text-slate-500 text-sm"> / mes</span>
                      </div>

                      <ul className="mt-6 space-y-3 text-sm text-slate-600 border-t border-slate-100 pt-6">
                        {p.features?.map((feat, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-8 space-y-3">
                      <button
                        onClick={() => { setSelectedPlan(p.name); setModalOpen(true); }}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all"
                      >
                        Consultar Promoción
                      </button>
                      <a
                        href={campaign.referral_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={trackReferralClick}
                        className="w-full py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <span>Registro de Campaña</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-200 relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>

            {leadSent ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">¡Solicitud Guardada!</h3>
                <p className="text-sm text-slate-600">Un asesor de J R Consulting se comunicará contigo.</p>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Solicitar Información o Descuento</h3>
                <p className="text-xs text-slate-500 mt-1 mb-6">Campaña: <strong>{campaign.title}</strong></p>

                {leadError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{leadError}</span>
                  </div>
                )}

                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      placeholder="Ej. Juan Pérez"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      value={leadForm.email}
                      onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                      placeholder="juan@empresa.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Empresa</label>
                      <input
                        type="text"
                        required
                        value={leadForm.company}
                        onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                        placeholder="Mi Empresa"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Plan</label>
                      <input
                        type="text"
                        value={selectedPlan}
                        onChange={(e) => setSelectedPlan(e.target.value)}
                        placeholder="Plan de interés"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingLead}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md mt-4 disabled:opacity-50"
                  >
                    {submittingLead ? "Enviando..." : "Enviar Solicitud"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">JR</div>
              <span className="text-white font-bold text-base">J R Consulting</span>
            </div>
            <a href="https://jrconsulting.com.mx" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2">
              <span>Ir al Sitio Corporativo</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            </a>
          </div>
          <hr className="border-slate-800" />
          <p>© {new Date().getFullYear()} J R Consulting. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
