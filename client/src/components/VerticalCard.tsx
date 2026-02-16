import { motion } from "framer-motion";

interface VerticalCardProps {
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
  onButtonClick?: () => void;
  onClick?: () => void;
  imageHeight?: string;
}

export function VerticalCard({
  image,
  title,
  subtitle,
  buttonText,
  onButtonClick,
  onClick,
  imageHeight = "180px",
}: VerticalCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="rounded-2xl overflow-hidden bg-white cursor-pointer"
      style={{ boxShadow: "0 4px 20px rgba(124, 58, 237, 0.1)" }}
      data-testid="card-vertical"
    >
      <div className="w-full overflow-hidden" style={{ height: imageHeight }}>
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          data-testid="img-card-vertical"
        />
      </div>
      <div className="p-4 flex flex-col items-center text-center gap-1">
        <h3
          className="text-base font-bold text-gray-800 line-clamp-2"
          data-testid="text-card-title"
        >
          {title}
        </h3>
        <p
          className="text-xs text-gray-400 line-clamp-2"
          data-testid="text-card-subtitle"
        >
          {subtitle}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onButtonClick?.();
          }}
          className="mt-3 px-6 py-2 rounded-full text-xs font-bold text-white"
          style={{
            background: "linear-gradient(135deg, #8a3ffc 0%, #6b21a8 100%)",
            boxShadow: "0 2px 10px rgba(138, 63, 252, 0.3)",
          }}
          data-testid="button-card-action"
        >
          {buttonText}
        </button>
      </div>
    </motion.div>
  );
}
