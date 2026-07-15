interface RadarChartProps {
  topics: string[];
  values: number[]; // 0-100 for each topic
  size?: number;
}

export default function RadarChart({ topics, values, size = 200 }: RadarChartProps) {
  const center = size / 2;
  const radius = size / 2 - 30;
  const n = topics.length;
  const angleStep = (2 * Math.PI) / n;

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const dataPoints = values.map((v, i) => getPoint(i, v));
  const polygonPath = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid circles */}
        {[25, 50, 75, 100].map((level) => {
          const points = Array.from({ length: n })
            .map((_, i) => {
              const p = getPoint(i, level);
              return `${p.x},${p.y}`;
            })
            .join(' ');
          return (
            <polygon
              key={level}
              points={points}
              fill="none"
              stroke="currentColor"
              className="text-surface-variant"
              strokeWidth="0.5"
              opacity="0.5"
            />
          );
        })}

        {/* Axis lines */}
        {topics.map((_, i) => {
          const p = getPoint(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="currentColor"
              className="text-surface-variant"
              strokeWidth="0.5"
              opacity="0.3"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={polygonPath}
          fill="rgba(0, 104, 95, 0.15)"
          stroke="#00685f"
          strokeWidth="2"
        />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#00685f"
            stroke="white"
            strokeWidth="2"
          />
        ))}

        {/* Labels */}
        {topics.map((topic, i) => {
          const p = getPoint(i, 120);
          const label = topic.length > 10 ? topic.substring(0, 8) + '...' : topic;
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] fill-on-surface-variant font-medium"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
