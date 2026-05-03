export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 56"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="0"
        y="46"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="56"
        fontWeight="700"
        letterSpacing="-2"
      >
        V
      </text>
      <g transform="translate(40,0)">
        <text
          x="0"
          y="46"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="56"
          fontWeight="700"
          letterSpacing="-2"
        >
          O
        </text>
        <line
          x1="-4"
          y1="46"
          x2="46"
          y2="4"
          stroke="currentColor"
          strokeWidth="3"
        />
      </g>
      <text
        x="86"
        y="46"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="56"
        fontWeight="700"
        letterSpacing="-2"
      >
        RN
      </text>
    </svg>
  );
}
