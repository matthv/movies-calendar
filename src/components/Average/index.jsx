// Remplace react-circular-progressbar : un cercle SVG et un pourcentage.

export default function Average({ percentage, strokeWidth = 7 }) {
  const value = Math.max(0, Math.min(100, Math.round(percentage || 0)));
  const radius = 50 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg className="circular-progressbar" viewBox="0 0 100 100" role="img" aria-label={`${value}%`}>
      <circle className="circular-progressbar-trail" cx="50" cy="50" r={radius} strokeWidth={strokeWidth} fill="none" />
      <circle className="circular-progressbar-path" cx="50" cy="50" r={radius} strokeWidth={strokeWidth} fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - value / 100)}
              transform="rotate(-90 50 50)" />
      <text className="circular-progressbar-text" x="50" y="50">{value}%</text>
    </svg>
  );
}
