import { useParams, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function NumerosIntroPage() {
  const { categoria, itemId } = useParams<{ categoria: string; itemId: string }>();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-500 via-teal-400 to-emerald-500 flex flex-col">
      <header className="p-4">
        <button
          onClick={() => setLocation(`/entrenamiento/${categoria}`)}
          className="flex items-center gap-2 text-white font-semibold"
          data-testid="button-back"
        >
          <ArrowLeft className="w-6 h-6" />
          Volver
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div className="flex justify-center mb-6">
          <img 
            src="https://i.imgur.com/7QxKJwS.png" 
            alt="Cerebro con números y letras" 
            className="w-56 h-56 object-contain"
          />
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-4">
          Identifica rápidamente<br />Números y Letras
        </h1>

        <p className="text-lg text-white/90 text-center mb-2">
          ¡Haz más fuerte tu vista jugando!
        </p>

        <p className="text-white/80 text-center mb-10 px-4">
          Identifica el número o letra para ver el mundo más grande
        </p>

        <button
          onClick={() => setLocation(`/numeros/${categoria}/${itemId}/ejercicio`)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-12 rounded-full text-lg shadow-lg transition-all"
          data-testid="button-empezar"
        >
          Empezar
        </button>
      </main>
    </div>
  );
}
