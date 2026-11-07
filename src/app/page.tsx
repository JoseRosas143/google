"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Mail, 
  ExternalLink, 
  Laptop, 
  Video, 
  CheckCircle2, 
  Check, 
  Building2, 
  ArrowRight,
  HelpCircle,
  FileText,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface PlanItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
}

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("Business Standard");
  const [leadForm, setLeadForm] = useState({ name: "", email: "", company: "", country: "México", notes: "" });
  const [loading, setLoading] = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados dinámicos sincronizados con Supabase (con fallback)
  const [heroTitle, setHeroTitle] = useState("Trabaja mejor. Colabora desde cualquier lugar con Google Workspace");
  const [heroSubtitle, setHeroSubtitle] = useState("Profesionaliza la comunicación de tu empresa, organiza tus archivos con seguridad empresarial y potencia el trabajo en equipo con la asesoría de J R Consulting.");
  const [promoTitle, setPromoTitle] = useState("¿Buscas un descuento exclusivo para tu empresa?");
  const [promoSubtitle, setPromoSubtitle] = useState("J R Consulting cuenta con inventario de códigos promocionales para la región de América en Business Starter y Business Standard. Solicita información y te orientaremos en el proceso.");
  
  const [plans, setPlans] = useState<PlanItem[]>([
    {
      id: "1",
      name: "Business Starter",
      slug: "business-starter",
      price: 6,
      currency: "USD",
      description: "Para profesionales independientes y pequeños equipos.",
      features: [
        "Correo electrónico empresarial personalizado",
        "30 GB de almacenamiento por usuario",
        "Videollamadas de hasta 100 participantes",
        "Controles de seguridad y administración"
      ]
    },
    {
      id: "2",
      name: "Business Standard",
      slug: "business-standard",
      price: 12,
      currency: "USD",
      description: "Para empresas que requieren mayor colaboración y espacio.",
      features: [
        "Todo lo incluido en Starter",
        "2 TB de almacenamiento agrupado por usuario",
        "Videollamadas de hasta 150 participantes",
        "Grabación de reuniones en Google Drive"
      ]
    }
  ]);

  // Sincronizar contenidos y planes dinámicos desde Supabase
  useEffect(() => {
    const loadDynamicContent = async () => {
      try {
        // Cargar CMS
        const { data: cmsData } = await supabase.from("site_content").select("*");
        if (cmsData) {
          const hero = cmsData.find(c => c.section_key === "hero");
          if (hero?.title) setHeroTitle(hero.title);
          if (hero?.subtitle) setHeroSubtitle(hero.subtitle);

          const promo = cmsData.find(c => c.section_key === "promo_banner");
          if (promo?.title) setPromoTitle(promo.title);
          if (promo?.subtitle) setPromoSubtitle(promo.subtitle);
        }

        // Cargar Planes
        const { data: plansData } = await supabase.from("plans").select("*").order("price", { ascending: true });
        if (plansData && plansData.length > 0) {
          setPlans(plansData.map(p => ({
            ...p,
            features: Array.isArray(p.features) ? p.features : []
          })));
        }
      } catch (err) {
        console.warn("Usando datos locales de respaldo:", err);
      }
    };

    loadDynamicContent();
  }, []);

  const trackReferralClick = async () => {
    try {
      await supabase.from("analytics_events").insert([
        {
          event_name: "referral_click",
          page_path: window.location.pathname,
          metadata: { target_url: "https://referworkspace.app.goo.gl/B9iH" }
        }
      ]);
    } catch (e) {
      console.warn("Evento no registrado:", e);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.from("leads").insert([
        {
          name: leadForm.name,
          email: leadForm.email,
          company: leadForm.company,
          country: leadForm.country,
          message: `Plan seleccionado: ${selectedPlan}. Notas: ${leadForm.notes}`,
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
      setErrorMessage(err.message || "Error al conectar con la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
              JR
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">J R CONSULTING</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                Partner & Referral
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#workspace" className="hover:text-blue-600 transition-colors">¿Qué es?</a>
            <a href="#beneficios" className="hover:text-blue-600 transition-colors">Beneficios</a>
            <a href="#planes" className="hover:text-blue-600 transition-colors">Planes</a>
            <a href="#descuentos" className="hover:text-blue-600 transition-colors">Descuentos</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">Preguntas Frecuentes</a>
          </nav>

          <div className="flex items-center gap-3">
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

      {/* HERO PRINCIPAL DINÁMICO */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-blue-50/50 via-white to-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                  <Building2 className="w-3.5 h-3.5" />
                  Soluciones de Productividad Cloud para Empresas
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                  {heroTitle}
                </h1>

                <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                  {heroSubtitle}
                </p>

                {/* BOTONES OFICIALES */}
                <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <a
                    href="https://referworkspace.app.goo.gl/B9iH"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={trackReferralClick}
                    aria-label="Registrarse en Google Workspace mediante el enlace de referencia"
                    className="inline-block transition-transform hover:scale-[1.03] active:scale-95 shadow-md rounded"
                  >
                    <img
                      src="https://storage.googleapis.com/referworkspace-asset/img/digitalbuttons/digital_button_es_419.png"
                      alt="Registrarse en Google Workspace mediante el enlace de referencia"
                      className="h-12 w-auto max-w-full"
                      loading="lazy"
                    />
                  </a>

                  <button
                    onClick={() => setModalOpen(true)}
                    className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <span>Consultar Descuento Disponible</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-6 pt-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Prueba oficial de 14 días</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Descuentos promocionales exclusivos</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Asesoría J R Consulting</span>
                </div>
              </div>

              {/* TARJETA DESTACADA */}
              <div className="lg:col-span-5">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200/80 relative">
                  <div className="absolute -top-3 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                    Edición Recomendada
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Business Standard</h3>
                  <p className="text-sm text-slate-500 mt-1">Ideal para equipos en crecimiento que requieren almacenamiento y reuniones avanzadas.</p>
                  
                  <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Almacenamiento por usuario</span>
                      <span className="font-bold text-slate-900">2 TB agrupado</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Videollamadas en Google Meet</span>
                      <span className="font-bold text-slate-900">150 participantes</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Grabaciones de reuniones</span>
                      <span className="font-bold text-emerald-600">Incluido en Drive</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => { setSelectedPlan("Business Standard"); setModalOpen(true); }}
                      className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-all"
                    >
                      Solicitar Descuento para Business Standard
                    </button>
                    <a
                      href="https://referworkspace.app.goo.gl/B9iH"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={trackReferralClick}
                      className="w-full py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-sm flex items-center justify-center gap-2 transition-all border border-blue-200"
                    >
                      <span>Comenzar Prueba Directa</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CONTENIDO ORIGINAL EXACTO WORKSPACE */}
        <section id="workspace" className="py-16 bg-white border-y border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900">Información Oficial y Aspectos Destacados</h2>
              <p className="text-slate-600 mt-2">Mensaje y recursos oficiales del programa de referencias de Google Workspace.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-slate-700 leading-relaxed">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">¿Qué es Google Workspace?</h3>
                <p>
                  Google Workspace es un paquete de productividad basado en la nube que ayuda a los equipos a comunicarse, colaborar y realizar tareas en cualquier lugar y en cualquier dispositivo. Es sencillo de configurar, usar y administrar, por lo que su empresa se puede enfocar en lo que realmente importa.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
                <a 
                  href="https://www.youtube.com/c/googleworkspace" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 underline"
                >
                  <Video className="w-4 h-4" /> Mire un video oficial
                </a>
                <span className="text-slate-300">|</span>
                <a 
                  href="https://referworkspace.app.goo.gl/one-pager" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 underline"
                >
                  <FileText className="w-4 h-4" /> Descubra más aquí (One-Pager)
                </a>
              </div>

              <hr className="border-slate-200" />

              <div className="space-y-4">
                <p className="font-bold text-slate-900">Estos son algunos aspectos destacados:</p>

                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">Correo electrónico empresarial para su dominio</h4>
                  <p className="text-sm text-slate-600">
                    Luzca profesional y comuníquese como usted@suempresa.com. Las funciones sencillas de Gmail lo ayudan a desarrollar su marca mientras realiza más tareas.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">Acceso desde cualquier ubicación o dispositivo</h4>
                  <p className="text-sm text-slate-600">
                    Revise correos electrónicos, comparta archivos, edite documentos, organice videoconferencias y mucho más en el trabajo, en casa o dondequiera que esté. Puede retomar su actividad donde la dejó en una computadora, tablet o un teléfono.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">Herramientas de administración de nivel empresarial</h4>
                  <p className="text-sm text-slate-600">
                    La configuración de administración sólida le otorga el control total sobre los usuarios, los dispositivos, la seguridad y otros aspectos.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-sm space-y-2">
                <p className="font-medium text-slate-800">
                  Regístrese con mi vínculo{" "}
                  <a 
                    href="https://referworkspace.app.goo.gl/B9iH" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    onClick={trackReferralClick}
                    className="text-blue-700 font-bold underline break-all"
                  >
                    https://referworkspace.app.goo.gl/B9iH
                  </a>{" "}
                  a fin de obtener una prueba de 14 días y envíeme un mensaje si desea recibir un descuento exclusivo cuando pruebe Google Workspace para su empresa.
                </p>
                <p className="text-xs text-slate-500 italic">
                  * La disponibilidad de la prueba gratuita de 14 días y las promociones están sujetas a los requisitos y términos vigentes de Google.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFICIOS COMERCIALES */}
        <section id="beneficios" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-extrabold text-slate-900">¿Por qué elegir Google Workspace con J R Consulting?</h2>
              <p className="text-slate-600 mt-3 text-lg">
                Herramientas profesionales conectadas para impulsar la productividad y seguridad de tu organización.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-6">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Correo Corporativo</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Utiliza Gmail con tu propio dominio (ej. contacto@tuempresa.com). Genera confianza inmediata con tus clientes mediante la infraestructura más segura.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-6">
                  <Laptop className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Colaboración en Tiempo Real</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Google Docs, Sheets y Slides permiten al equipo editar simultáneamente desde cualquier dispositivo con historial de versiones.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Control y Seguridad Total</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Consola de administración centralizada para gestionar usuarios, permisos, verificación en dos pasos y políticas en todos los dispositivos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARACIÓN DINÁMICA DE PLANES (DESDE SUPABASE) */}
        <section id="planes" className="py-20 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Catálogo de Ediciones
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-3">Elige la edición ideal para tu equipo</h2>
              <p className="text-slate-600 mt-2">Planes configurados y actualizados desde el panel administrativo.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans.map((plan, index) => {
                const isPopular = plan.slug.includes("standard") || index === 1;

                return (
                  <div
                    key={plan.id}
                    className={`rounded-3xl p-8 flex flex-col justify-between transition-all ${
                      isPopular
                        ? "border-2 border-blue-600 bg-blue-50/20 shadow-xl relative"
                        : "border border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3.5 right-8 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Recomendado
                      </div>
                    )}

                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
                      
                      <div className="mt-6">
                        <span className="text-4xl font-extrabold text-slate-900">${plan.price} {plan.currency}</span>
                        <span className="text-slate-500 text-sm"> / usuario / mes</span>
                      </div>

                      <ul className="mt-6 space-y-3 text-sm text-slate-600 border-t border-slate-100 pt-6">
                        {plan.features?.map((feat, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-8 space-y-3">
                      <button
                        onClick={() => { setSelectedPlan(plan.name); setModalOpen(true); }}
                        className={`w-full py-3 rounded-xl font-medium text-sm transition-all ${
                          isPopular 
                            ? "bg-slate-900 hover:bg-slate-800 text-white" 
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        Consultar Descuento
                      </button>
                      <a
                        href="https://referworkspace.app.goo.gl/B9iH"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={trackReferralClick}
                        className="w-full py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm flex items-center justify-center gap-2 transition-all"
                      >
                        <span>Registro Oficial B9iH</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECCIÓN DESCUENTOS Y BOTÓN GMAIL (DINÁMICO DESDE CMS) */}
        <section id="descuentos" className="py-20 bg-slate-900 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {promoTitle}
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {promoSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
              <button
                onClick={() => setModalOpen(true)}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-base shadow-lg transition-all"
              >
                Solicitar Descuento Individual
              </button>

              <div className="flex flex-col items-center gap-1">
                <a
                  href="mailto:google@jrconsulting.com.mx"
                  aria-label="Contactar a J R Consulting por correo electrónico"
                  className="inline-block transition-transform hover:scale-105 active:scale-95 shadow-md"
                >
                  <img
                    src="https://storage.googleapis.com/referworkspace-asset/img/digitalbuttons/digital_button_gmail_es_419.png"
                    alt="Contactar a J R Consulting por Gmail"
                    className="h-12 w-auto max-w-full"
                    loading="lazy"
                  />
                </a>
                <span className="text-[11px] text-slate-400">google@jrconsulting.com.mx</span>
              </div>
            </div>
          </div>
        </section>

        {/* PREGUNTAS FRECUENTES */}
        <section id="faq" className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-slate-900">Preguntas Frecuentes</h2>
              <p className="text-slate-600 mt-2">Claridad y transparencia en el proceso de contratación y promociones.</p>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600" /> ¿Cómo funciona la prueba gratuita de 14 días?
                </h3>
                <p className="mt-2 text-slate-600 text-sm leading-relaxed">
                  Al registrarte utilizando el enlace oficial de referencia proporcionado (B9iH), Google Workspace te otorga una prueba de 14 días para explorar las herramientas con tu equipo sin costo inicial, sujeto a elegibilidad.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600" /> ¿Cómo se aplican los códigos promocionales?
                </h3>
                <p className="mt-2 text-slate-600 text-sm leading-relaxed">
                  Los códigos promocionales son de uso único y aplican para clientes nuevos elegibles en el continente americano. Se introducen directamente en el panel de facturación de Google Workspace durante la configuración de pago.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600" /> ¿Necesito tener un dominio web propio?
                </h3>
                <p className="mt-2 text-slate-600 text-sm leading-relaxed">
                  Sí, para utilizar el correo corporativo (ej. contacto@empresa.com) requieres un dominio. Si aún no cuentas con uno, puedes adquirirlo directamente al iniciar el registro en Google Workspace o solicitar asesoría con J R Consulting.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* MODAL SOLICITUD */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-200 relative">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 text-xl font-bold"
            >
              ✕
            </button>

            {leadSent ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">¡Solicitud Guardada!</h3>
                <p className="text-sm text-slate-600">
                  Tus datos han sido registrados en nuestro sistema. Un asesor de J R Consulting verificará la elegibilidad y se comunicará contigo.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Solicitar Descuento Promocional</h3>
                <p className="text-xs text-slate-500 mt-1 mb-6">
                  Los códigos se asignan y gestionan de forma individual conforme a los términos de Google.
                </p>

                {errorMessage && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
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
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Correo Electrónico Empresarial</label>
                    <input
                      type="email"
                      required
                      value={leadForm.email}
                      onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                      placeholder="juan@tuempresa.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                        placeholder="Mi Empresa S.A."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Edición de Interés</label>
                      <select
                        value={selectedPlan}
                        onChange={(e) => setSelectedPlan(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        {plans.map(p => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 italic pt-2">
                    Al enviar aceptas ser contactado por J R Consulting para fines informativos y asignación de la promoción.
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all mt-4 disabled:opacity-50"
                  >
                    {loading ? "Registrando..." : "Enviar Solicitud"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">JR</div>
              <span className="text-white font-bold text-base tracking-wide">J R Consulting</span>
            </div>

            <a
              href="https://jrconsulting.com.mx"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-2"
            >
              <span>Ir a J R Consulting</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            </a>

            <div className="flex items-center gap-4">
              <a 
                href="https://referworkspace.app.goo.gl/B9iH" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={trackReferralClick}
                className="hover:text-white transition-colors"
              >
                Enlace Oficial B9iH
              </a>
              <span>•</span>
              <a 
                href="mailto:google-ref@jrconsulting.com.mx" 
                className="hover:text-white transition-colors"
              >
                google-ref@jrconsulting.com.mx
              </a>
            </div>
          </div>

          <hr className="border-slate-800" />

          <div className="space-y-2 text-slate-300 leading-relaxed max-w-4xl">
            <p className="font-semibold text-slate-200">Aviso de Independencia Comercial y Divulgación:</p>
            <p>
              J R Consulting es un proyecto independiente de consultoría y promoción tecnológica. Google Workspace y las marcas comerciales asociadas son propiedad de Google LLC. Esta plataforma no es operada ni administrada por Google y no implica respaldo oficial directo salvo las autorizaciones del programa de referencias de Google Workspace. J R Consulting puede recibir una compensación por referencias exitosas conforme a los términos del programa.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400">
            <p>© {new Date().getFullYear()} J R Consulting. Todos los derechos reservados.</p>
            <div className="flex gap-4">
              <a href="https://workspace.google.com/intl/es-419_mx/landing/partners/referral/terms/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                Términos del Programa
              </a>
              <a href="https://workspace.google.com/intl/es-419/terms/promotion_code_terms/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                Términos de Códigos
              </a>
              <a href="/admin" className="text-slate-600 hover:text-slate-400">
                Acceso Administrativo
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
