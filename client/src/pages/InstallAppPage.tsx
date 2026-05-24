import { Apple, ArrowLeft, ArrowRight, Bell, CheckCircle2, Monitor, Smartphone } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const LOGO_URL = "/iqxponencial-icon-192.png";

type Step = {
  number: string;
  title: string;
  description: string;
  image: string;
  objectPosition?: string;
};

const iphoneSteps: Step[] = [
  {
    number: "1",
    title: "Abre esta pagina en Safari",
    description: "Si estas dentro de Instagram, WhatsApp, Facebook o Chrome, abre iqexponencial.app en Safari.",
    image: "/ios/webp/iphone-step-1.webp",
    objectPosition: "center 20%",
  },
  {
    number: "2",
    title: "Toca el boton Compartir",
    description: "Presiona el icono de compartir en la barra inferior de Safari.",
    image: "/ios/webp/iphone-step-2.webp",
    objectPosition: "center 82%",
  },
  {
    number: "3",
    title: "Elige Agregar a pantalla de inicio",
    description: "Busca esa opcion en el menu. Si no la ves, desliza la lista hacia abajo.",
    image: "/ios/webp/iphone-step-3.webp",
    objectPosition: "center 62%",
  },
  {
    number: "4",
    title: "Toca Agregar",
    description: "Confirma el nombre IQeXponencial y pulsa Agregar.",
    image: "/ios/webp/iphone-step-4.webp",
    objectPosition: "center 18%",
  },
];

const macSteps: Step[] = [
  {
    number: "1",
    title: "Abre iqexponencial.app en Safari",
    description: "Entra al sitio desde Safari para crear el acceso directo.",
    image: "/ios/webp/mac-step-1.webp",
    objectPosition: "center 72%",
  },
  {
    number: "2",
    title: "Haz clic en Compartir",
    description: "Busca el boton Compartir en la barra de herramientas.",
    image: "/ios/webp/mac-step-2.webp",
    objectPosition: "center 16%",
  },
  {
    number: "3",
    title: "Selecciona Agregar al Dock",
    description: "Elige Agregar al Dock en el menu de Safari.",
    image: "/ios/webp/mac-step-3.webp",
    objectPosition: "center 35%",
  },
  {
    number: "4",
    title: "Confirma con Agregar",
    description: "Acepta el nombre y abre IQeXponencial desde el Dock o Launchpad.",
    image: "/ios/webp/mac-step-4.webp",
    objectPosition: "center 46%",
  },
];

function StepCard({ step, accent }: { step: Step; accent: "cyan" | "violet" }) {
  const accentClass = accent === "cyan" ? "text-cyan-500" : "text-violet-500";
  const numberClass = accent === "cyan" ? "text-cyan-100/70" : "text-violet-100/80";

  return (
    <article className="grid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_26px_rgba(15,23,42,0.07)] sm:grid-cols-[43%_57%]">
      <div className="h-40 bg-slate-100 sm:h-full">
        <img
          src={step.image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
          style={{ objectPosition: step.objectPosition || "center" }}
        />
      </div>
      <div className="relative min-h-40 p-5 pr-16">
        <div className={`absolute right-4 top-1 text-[5.25rem] font-black leading-none ${numberClass}`}>{step.number}</div>
        <div className="relative z-10">
          <p className={`text-[11px] font-black uppercase tracking-[0.18em] ${accentClass}`}>Paso {step.number}</p>
          <h3 className="mt-2 text-lg font-black leading-tight text-slate-950">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
        </div>
      </div>
    </article>
  );
}

function SectionTitle({
  label,
  title,
  icon: Icon,
  accent,
}: {
  label: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "cyan" | "violet";
}) {
  const color = accent === "cyan" ? "bg-cyan-500 text-cyan-50" : "bg-violet-500 text-violet-50";
  const text = accent === "cyan" ? "text-cyan-600" : "text-violet-600";

  return (
    <div className="mb-4 flex items-center gap-3">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-lg ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className={`text-xs font-black uppercase tracking-[0.18em] ${text}`}>{label}</p>
        <h2 className="text-2xl font-black leading-tight text-slate-950">{title}</h2>
      </div>
    </div>
  );
}

export default function InstallAppPage() {
  const [, setLocation] = useLocation();

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <section className="relative overflow-hidden rounded-b-[1.75rem] bg-[#07113a] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(34,211,238,0.20),transparent_24rem),radial-gradient(circle_at_88%_18%,rgba(124,58,237,0.50),transparent_24rem)]" />
        <div className="absolute right-[-5rem] top-[-7rem] h-64 w-64 rounded-full bg-violet-600/40 blur-sm" />
        <div className="absolute bottom-10 right-[12%] h-24 w-80 rounded-full border border-cyan-300/25 shadow-[0_0_50px_rgba(34,211,238,0.35)]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-12">
          <div>
            <button
              type="button"
              onClick={() => setLocation("/")}
              className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition hover:bg-white/15"
              aria-label="Volver al inicio"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="mb-5 inline-flex items-center gap-2 rounded-xl border border-cyan-300/40 bg-white/5 px-4 py-2 text-sm font-black text-white shadow-[0_0_24px_rgba(34,211,238,0.15)]">
              <Apple className="h-4 w-4" />
              Instalacion guiada para Apple
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.98] tracking-normal sm:text-6xl lg:text-7xl">
              Instala IQeXponencial <span className="block text-cyan-300">como app</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/78 sm:text-lg">
              Abre IQeXponencial desde Safari y agregala a tu pantalla de inicio o al Dock siguiendo estos pasos.
            </p>
          </div>

          <div className="grid place-items-center lg:justify-end">
            <div className="relative">
              <div className="absolute inset-x-[-2.5rem] bottom-[-1.5rem] h-20 rounded-full border border-cyan-300/25 shadow-[0_0_42px_rgba(34,211,238,0.42)]" />
              <div className="relative flex aspect-[1.08] w-64 items-center justify-center rounded-3xl border border-white/20 bg-white shadow-2xl shadow-violet-950/40 sm:w-80">
                <img src={LOGO_URL} alt="IQeXponencial" className="h-40 w-40 object-contain sm:h-48 sm:w-48" />
                <div className="absolute -bottom-4 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-black text-white shadow-xl shadow-cyan-950/25">
                  <CheckCircle2 className="h-4 w-4" />
                  Acceso directo
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="grid gap-8 xl:grid-cols-2">
          <div>
            <SectionTitle label="iPhone y iPad" title="Pantalla de inicio" icon={Smartphone} accent="cyan" />
            <div className="grid gap-4">
              {iphoneSteps.map((step) => (
                <StepCard key={step.number} step={step} accent="cyan" />
              ))}
            </div>
          </div>

          <div>
            <SectionTitle label="Mac" title="Agregar al Dock" icon={Monitor} accent="violet" />
            <div className="grid gap-4">
              {macSteps.map((step) => (
                <StepCard key={step.number} step={step} accent="violet" />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-cyan-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-600">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-950">Despues de instalar</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  Abre la app instalada y acepta las notificaciones cuando aparezca el aviso.
                </p>
              </div>
            </div>
            <Button onClick={() => setLocation("/")} className="h-12 bg-slate-950 px-6 font-bold text-white hover:bg-slate-800">
              Volver a IQeXponencial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
