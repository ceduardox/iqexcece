interface FlagIconProps {
  code: string;
  size?: number;
}

export function FlagIcon({ code, size = 20 }: FlagIconProps) {
  const s = size;
  
  if (code === "es") {
    return (
      <svg width={s} height={Math.round(s * 0.67)} viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg">
        <rect width="30" height="20" fill="#c60b1e" />
        <rect y="5" width="30" height="10" fill="#ffc400" />
      </svg>
    );
  }
  
  if (code === "en") {
    return (
      <svg width={s} height={Math.round(s * 0.53)} viewBox="0 0 30 16" xmlns="http://www.w3.org/2000/svg">
        <rect width="30" height="16" fill="#b22234" />
        {[0,2,4,6,8,10,12].map(i => (
          <rect key={i} y={i * 1.23} width="30" height="1.23" fill={i % 2 === 0 ? "#b22234" : "#fff"} />
        ))}
        <rect width="12" height="8.6" fill="#3c3b6e" />
      </svg>
    );
  }
  
  if (code === "pt") {
    return (
      <svg width={s} height={Math.round(s * 0.67)} viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg">
        <rect width="30" height="20" fill="#009b3a" />
        <polygon points="15,2 28,10 15,18 2,10" fill="#fedf00" />
        <circle cx="15" cy="10" r="4" fill="#002776" />
      </svg>
    );
  }
  
  return null;
}
