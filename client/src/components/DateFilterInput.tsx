import { useRef } from "react";
import { CalendarDays } from "lucide-react";

type DateFilterInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputTestId?: string;
};

export function DateFilterInput({ label, value, onChange, inputTestId }: DateFilterInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const input = inputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
    if (!input) return;
    input.focus();
    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }
    input.click();
  };

  return (
    <div>
      <label className="text-white/50 text-xs mb-1 block">{label}</label>
      <div className="relative">
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-black/60 border border-purple-500/40 text-white text-xs rounded-lg px-3 py-2.5 pr-10 w-full focus:border-cyan-400 focus:outline-none cursor-pointer [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          data-testid={inputTestId}
        />
        <button
          type="button"
          onClick={openPicker}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-cyan-300 transition-colors"
          aria-label={`Abrir calendario para ${label.toLowerCase()}`}
        >
          <CalendarDays className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
