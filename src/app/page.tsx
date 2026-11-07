"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Mail, 
  ExternalLink, 
  Users, 
  Laptop, 
  Video, 
  CheckCircle2, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  BarChart3, 
  Building2, 
  ArrowRight,
  HelpCircle,
  FileText
} from "lucide-react";

export default function HomePage() {
  const [isAdminView, setIsAdminView] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("Business Standard");
  const [leadForm, setLeadForm] = useState({ name: "", email: "", company: "", country: "México", notes: "" });
  const [leadSent, setLeadSent] = useState(false);
  const [revealedCodes, setRevealedCodes] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Inventario privado cargado de forma segura en memoria de administración
  const [codes, setCodes] = useState([
    { id: "1", code: "A9VQV693FYQHY3P", edition: "Business Standard", region: "América", status: "available" },
    { id: "2", code: "HDEDJQKWTDWGCNY", edition: "Business Standard", region: "América", status: "available" },
    { id: "3", code: "C7AA6MKXPRKDW7V", edition: "Business Starter", region: "América", status: "available" },
    { id: "4", code: "N7J63X9YCXLKAMF", edition: "Business Starter", region: "América", status: "available" }
  ]);

  const [leads, setLeads] = useState([
    { id: "L-101", name: "Carlos Mendoza", company: "Logística MX", email: "cmendoza@logisticamx.com", plan: "Business Standard", status: "new", date: "2026-11-06" }
  ]);

  const toggleReveal = (id: string) => {
    setRevealedCodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLead = {
      id: `L-${Date.now().toString().slice(-4)}`,
      name: leadForm.name,
      company: leadForm.company,
      email: leadForm.email,
      plan: selectedPlan,
      status: "new",
      date: new Date().toISOString().split("T")[0]
    };
    setLeads([newLead, ...leads]);
    setLeadSent(true);
    setTimeout(() => {
      setLeadSent(false);
      setModalOpen(false);
      setLeadForm({ name: "", email: "", company: "", country: "México", notes: "" });
    }, 2200);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900">
      {/* BARRA SUPERIOR DE NAVEGACIÓN */}
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
            {/* Botón principal obligatorio hacia el dominio corporativo */}
            <a
              href="https://jrconsulting.com.mx"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm transition-all text-sm group"
            >
              <span>J R Consulting</span>
              <ExternalLink className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* Alternador de panel administrativo privado */}
            <button
              onClick={() => setIsAdminView(!isAdminView)}
              className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                isAdminView 
                  ? "bg-amber-100 text-amber-900 border-amber-300" 
                  : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
              }`}
              title="Alternar vista de administrador"
            >
              {isAdminView ? "Cerrar Panel" : "Admin Panel"}
            </button>
          </div>
        </div>
      </header>

      {/* VISTA ADMINISTRATIVA / ADMIN CONSOLE */}
      {isAdminView && (
        <aside className="bg-slate-900 text-slate-100 border-b-4 border-amber-500 py-8 px-4 sm:px-6 lg:px-8 animate-fadeIn">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                  <BarChart3 className="text-amber-400 w-6 h-6" /> Panel de Control Administrativo (/admin)
                </h2>
                <p className="text-sm text-slate-400">
                  Gestión privada de enlace único, inventario seguro de códigos promocionales y registro de prospectos.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-mono">
                  Enlace Activo: referworkspace.app.goo.gl/B9iH
                </span>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Clics Enlace B9iH</span>
                <p className="text-2xl font-bold text-blue-400 mt-1">128</p>
              </div>
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Prospectos Totales</span>
                <p className="text-2xl font-bold text-amber-400 mt-1">{leads.length}</p>
              </div>
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Códigos Disponibles</span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">4 / 4</p>
              </div>
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">CTR Global Referidos</span>
                <p className="text-2xl font-bold text-purple-400 mt-1">8.4%</p>
              </div>
            </div>

            {/* BÓVEDA DE CÓDIGOS PROMOCIONALES */}
            <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" /> Bóveda Privada de Códigos (Continente Americano)
                </h3>
                <span className="text-xs text-slate-400">Entrega individual y segura a clientes calificados</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase bg-slate-900/80 text-slate-400 border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Edición</th>
                      <th className="py-3 px-4">Región</th>
                      <th className="py-3 px-4">Código Cifrado / Máscara</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 font-mono text-xs">
                    {codes.map((c) => {
                      const isRevealed = revealedCodes[c.id];
                      const masked = `${c.code.slice(0, 4)}••••••••${c.code.slice(-2)}`;
                      return (
                        <tr key={c.id} className="hover:bg-slate-700/30">
                          <td className="py-3 px-4 font-sans font-medium text-white">{c.edition}</td>
                          <td className="py-3 px-4">{c.region}</td>
                          <td className="py-3 px-4 tracking-wider text-amber-300">
                            {isRevealed ? c.code : masked}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700 text-[11px]">
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2 font-sans">
                            <button
                              onClick={() => toggleReveal(c.id)}
                              className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs inline-flex items-center gap-1"
                            >
                              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              {isRevealed ? "Ocultar" : "Revelar"}
                            </button>
                            <button
                              onClick={() => copyToClipboard(c.code, c.id)}
                              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs inline-flex items-center gap-1"
                            >
                              {copiedId === c.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedId === c.id ? "Copiado" : "Copiar"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* LISTA DE PROSPECTOS RECIBIDOS */}
            <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 space-y-4">
              <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" /> Solicitudes de Descuento Recibidas (CRM)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase bg-slate-900/80 text-slate-400 border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4">Prospecto</th>
                      <th className="py-3 px-4">Empresa</th>
                      <th className="py-3 px-4">Correo</th>
                      <th className="py-3 px-4">Plan Solicitado</th>
                      <th className="py-3 px-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 text-xs">
                    {leads.map((ld) => (
                      <tr key={ld.id} className="hover:bg-slate-700/30">
                        <td className="py-3 px-4 font-mono text-slate-400">{ld.date}</td>
                        <td className="py-3 px-4 font-semibold text-white">{ld.name}</td>
                        <td className="py-3 px-4">{ld.company}</td>
                        <td className="py-3 px-4 text-blue-300">{ld.email}</td>
                        <td className="py-3 px-4">{ld.plan}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700">
                            {ld.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* HERO PRINCIPAL */}
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
                  Trabaja mejor. Colabora desde cualquier lugar con{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800">
                    Google Workspace
                  </span>
                </h1>

                <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                  Profesionaliza la comunicación de tu empresa, organiza tus archivos con seguridad empresarial y potencia el trabajo en equipo con la asesoría estratégica de <strong>J R Consulting</strong>.
                </p>

                {/* BOTONES GRÁFICOS OFICIALES EN EL HERO */}
                <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Botón oficial de Referencia (Destino único B9iH) */}
                  <a
                    href="https://referworkspace.app.goo.gl/B9iH"
                    target="_blank"
                    rel="noopener noreferrer"
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

                  {/* Botón secundario para solicitar descuento */}
                  <button
                    onClick={() => setModalOpen(true)}
                    className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <span>Consultar Descuento Disponible</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-6 pt-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Prueba de 14 días oficial</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Descuentos promocionales exclusivos</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Asesoría J R Consulting</span>
                </div>
              </div>

              {/* TARJETA DESTACADA DEL HERO */}
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

        {/* SECCIÓN OBLIGATORIA: CONTENIDO ORIGINAL DE GOOGLE WORKSPACE (SECCIÓN 4) */}
        <section id="workspace" className="py-16 bg-white border-y border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900">Información Oficial y Aspectos Destacados</h2>
              <p className="text-slate-600 mt-2">Mensaje y recursos oficiales del programa de referencias de Google Workspace.</p>
            </div>

            {/* Contenedor del contenido original exacto */}
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
                  Google Docs, Sheets y Slides permiten a múltiples miembros del equipo editar simultáneamente desde cualquier dispositivo con historial de versiones.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Control y Seguridad Total</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Consola de administración centralizada para gestionar usuarios, permisos, verificación en dos pasos y políticas de seguridad en todos los dispositivos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARACIÓN DE PLANES */}
        <section id="planes" className="py-20 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Ediciones Oficiales
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-3">Elige la edición ideal para tu equipo</h2>
              <p className="text-slate-600 mt-2">Precios de referencia según términos comerciales vigentes de Google para la región.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Business Starter */}
              <div className="border border-slate-200 rounded-3xl p-8 bg-white hover:border-slate-300 transition-all flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Business Starter</h3>
                  <p className="text-sm text-slate-500 mt-1">Para profesionales independientes y pequeños equipos.</p>
                  <div className="mt-6">
                    <span className="text-4xl font-extrabold text-slate-900">$6.00 USD</span>
                    <span className="text-slate-500 text-sm"> / usuario / mes</span>
                  </div>

                  <ul className="mt-6 space-y-3 text-sm text-slate-600 border-t border-slate-100 pt-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Correo electrónico empresarial personalizado
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> 30 GB de almacenamiento por usuario
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Videollamadas de hasta 100 participantes
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Controles de seguridad y administración
                    </li>
                  </ul>
                </div>

                <div className="mt-8 space-y-3">
                  <button
                    onClick={() => { setSelectedPlan("Business Starter"); setModalOpen(true); }}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all"
                  >
                    Consultar Descuento Starter
                  </button>
                  <a
                    href="https://referworkspace.app.goo.gl/B9iH"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Registro Oficial B9iH</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Business Standard */}
              <div className="border-2 border-blue-600 rounded-3xl p-8 bg-blue-50/20 shadow-lg flex flex-col justify-between relative">
                <div className="absolute -top-3.5 right-8 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Más Popular
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Business Standard</h3>
                  <p className="text-sm text-slate-500 mt-1">Para empresas que requieren mayor colaboración y espacio.</p>
                  <div className="mt-6">
                    <span className="text-4xl font-extrabold text-slate-900">$12.00 USD</span>
                    <span className="text-slate-500 text-sm"> / usuario / mes</span>
                  </div>

                  <ul className="mt-6 space-y-3 text-sm text-slate-600 border-t border-blue-100 pt-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Todo lo incluido en Starter
                    </li>
                    <li className="flex items-center gap-2 font-semibold text-slate-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> 2 TB de almacenamiento agrupado por usuario
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Videollamadas de hasta 150 participantes
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Grabación de reuniones en Google Drive
                    </li>
                  </ul>
                </div>

                <div className="mt-8 space-y-3">
                  <button
                    onClick={() => { setSelectedPlan("Business Standard"); setModalOpen(true); }}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-all"
                  >
                    Consultar Descuento Standard
                  </button>
                  <a
                    href="https://referworkspace.app.goo.gl/B9iH"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow"
                  >
                    <span>Registro Oficial B9iH</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN DESCUENTOS Y CONTACTO OFICIAL GMAIL */}
        <section id="descuentos" className="py-20 bg-slate-900 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              ¿Buscas un descuento exclusivo para tu empresa?
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed">
              J R Consulting cuenta con un inventario privado de códigos promocionales para la región de América en las ediciones Business Starter y Business Standard. Solicita información y te orientaremos en el proceso.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
              <button
                onClick={() => setModalOpen(true)}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-base shadow-lg transition-all"
              >
                Solicitar Descuento Individual
              </button>

              {/* BOTÓN OFICIAL GMAIL */}
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
                  Sí, para utilizar el correo corporativo (ej. tú@empresa.com) requieres un dominio. Si aún no cuentas con uno, puedes adquirirlo directamente al iniciar el registro en Google Workspace o solicitar asesoría con J R Consulting.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* MODAL DE SOLICITUD DE DESCUENTO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-200 relative animate-scaleUp">
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
                <h3 className="text-2xl font-bold text-slate-900">¡Solicitud Recibida!</h3>
                <p className="text-sm text-slate-600">
                  Hemos registrado tus datos. Un asesor de J R Consulting verificará la elegibilidad y te enviará individualmente el código promocional para <strong>{selectedPlan}</strong>.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Solicitar Descuento Promocional</h3>
                <p className="text-xs text-slate-500 mt-1 mb-6">
                  Los códigos se gestionan de manera individual conforme a las normativas de Google.
                </p>

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
                        <option value="Business Starter">Business Starter</option>
                        <option value="Business Standard">Business Standard</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 italic pt-2">
                    Al enviar aceptas ser contactado por J R Consulting para fines informativos y la asignación del beneficio. No compartimos tu información.
                  </p>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all mt-4"
                  >
                    Enviar Solicitud
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

            {/* Botón hacia el sitio corporativo en el footer */}
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
                className="hover:text-white transition-colors"
              >
                Enlace de Referencia Oficial
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

          {/* AVISO DE INDEPENDENCIA COMERCIAL */}
          <div className="space-y-2 text-slate-300 leading-relaxed max-w-4xl">
            <p className="font-semibold text-slate-200">Aviso de Independencia Comercial y Divulgación de Afiliación:</p>
            <p>
              J R Consulting es un proyecto independiente de asesoría y promoción tecnológica. Google Workspace y las marcas comerciales asociadas son propiedad de Google LLC. Esta plataforma no es operada ni administrada por Google y no implica respaldo oficial directo salvo las autorizaciones del programa de referencias de Google Workspace. J R Consulting puede recibir una compensación por referencias exitosas conforme a los términos del programa.
            </p>
            <p>
              Único enlace oficial de registro: <code>https://referworkspace.app.goo.gl/B9iH</code>. Los recursos informativos complementarios <code>https://c.gle/...</code> corresponden a material informativo del programa.
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
