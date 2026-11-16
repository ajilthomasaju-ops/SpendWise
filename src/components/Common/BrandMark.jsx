export function BrandMark({ inverted = false }) {
  return (
    <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
      <svg
        width="30"
        height="30"
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          width="30"
          height="30"
          rx="8"
          fill={inverted ? '#11161C' : '#0E1318'}
          stroke={inverted ? 'rgba(212,168,83,0.45)' : 'rgba(180,131,62,0.4)'}
          strokeWidth="1"
        />
        <path
          d="M8.5 18.2L12.8 13.8L16.2 16.6L21.5 11"
          stroke="#D4A853"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18.2 11H21.5V14.3"
          stroke="#D4A853"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={`font-editorial text-xl font-semibold tracking-tight ${
          inverted ? 'text-white' : 'text-stone-900 dark:text-stone-100'
        }`}
      >
        SpendWise
      </span>
    </div>
  );
}
