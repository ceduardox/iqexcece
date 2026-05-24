import { ArrowLeft, CheckCircle2, Dock, Home, Monitor, Plus, Share, Smartphone } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const LOGO_URL = "/iqxponencial-icon-192.png";

function InstallStep({
  number,
  title,
  description,
  icon: Icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="absolute right-4 top-3 text-[4.5rem] font-black leading-none text-slate-100">{number}</div>
      <div className="relative z-10 flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-cyan-900/10">
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-600">Paso {number}</p>
          <h3 className="mt-1 text-lg font-black leading-tight text-slate-950">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function InstallAppPage() {
  const [, setLocation] = useLocation();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.28),transparent_28rem),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.26),transparent_24rem)]" />
        <div className="relative mx-auto flex min-h-[48svh] max-w-6xl flex-col px-5 pb-10 pt-5 sm:px-8 lg:px-10">
          <button
            type="button"
            onClick={() => setLocation("/")}
            className="mb-8 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition hover:bg-white/15"
            aria-label="Volver al inicio"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="grid flex-1 items-center gap-8 md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200/25 bg-white/10 px-3 py-1.5 text-xs font-bold text-cyan-100 backdrop-blur">
                <CheckCircle2 className="h-4 w-4" />
                Instalacion guiada para Apple
              </div>
              <h1 className="max-w-3xl text-4xl font-black leading-[0.98] tracking-normal sm:text-5xl lg:text-6xl">
                Instala IQeXponencial como app
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/72 sm:text-lg">
                Abre IQeXponencial desde Safari y agregala a tu pantalla de inicio o al Dock siguiendo estos pasos.
              </p>
            </div>

            <div className="mx-auto grid w-full max-w-sm place-items-center">
              <div className="relative flex aspect-square w-52 items-center justify-center rounded-[2rem] border border-white/15 bg-white shadow-2xl shadow-cyan-950/40 sm:w-64">
                <img src={LOGO_URL} alt="IQeXponencial" className="h-32 w-32 object-contain sm:h-40 sm:w-40" />
                <div className="absolute -bottom-4 rounded-full bg-cyan-400 px-5 py-2 text-sm font-black text-slate-950 shadow-xl shadow-cyan-950/25">
                  Acceso directo
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500 text-white">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">iPhone y iPad</p>
                <h2 className="text-2xl font-black text-slate-950">Pantalla de inicio</h2>
              </div>
            </div>
            <div className="grid gap-4">
              <InstallStep
                number="1"
                icon={Smartphone}
                title="Abre esta pagina en Safari"
                description="Si estas dentro de Instagram, WhatsApp, Facebook o Chrome, abre iqexponencial.app en Safari."
              />
              <InstallStep
                number="2"
                icon={Share}
                title="Toca el boton Compartir"
                description="En Safari, presiona el icono de compartir. Normalmente aparece abajo en la barra del navegador."
              />
              <InstallStep
                number="3"
                icon={Plus}
                title="Elige Agregar a pantalla de inicio"
                description="Busca esa opcion en el menu. Si no la ves, desliza la lista hacia abajo hasta encontrarla."
              />
              <InstallStep
                number="4"
                icon={Home}
                title="Toca Agregar"
                description="Confirma el nombre IQeXponencial y pulsa Agregar. La app aparecera junto a tus aplicaciones."
              />
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500 text-white">
                <Monitor className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">Mac</p>
                <h2 className="text-2xl font-black text-slate-950">Agregar al Dock</h2>
              </div>
            </div>
            <div className="grid gap-4">
              <InstallStep
                number="1"
                icon={Monitor}
                title="Abre iqexponencial.app en Safari"
                description="En Mac, usa Safari para crear la app del sitio y dejarla en el Dock."
              />
              <InstallStep
                number="2"
                icon={Share}
                title="Haz clic en Compartir"
                description="Busca el boton Compartir en la barra de herramientas de Safari."
              />
              <InstallStep
                number="3"
                icon={Dock}
                title="Selecciona Agregar al Dock"
                description="Safari creara una app independiente de IQeXponencial para abrirla mas rapido."
              />
              <InstallStep
                number="4"
                icon={CheckCircle2}
                title="Confirma con Agregar"
                description="Acepta el nombre y abre IQeXponencial desde el Dock o Launchpad cuando quieras."
              />
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-950">Despues de instalar</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Abre la app instalada y acepta las notificaciones cuando aparezca el aviso.
              </p>
            </div>
            <Button onClick={() => setLocation("/")} className="h-11 bg-slate-950 px-5 font-bold text-white hover:bg-slate-800">
              Volver a IQeXponencial
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
