import React from 'react';

interface RiskMeterProps {
  score: number; // 0 to 100
  level?: string; // Optional text override
  theme?: 'light' | 'dark';
}

const RiskMeter: React.FC<RiskMeterProps> = ({ score, level }) => {
  // Clamp score between 0 and 100
  const clampedScore = Math.min(Math.max(score, 0), 100);
  
  // Calculate needle rotation (0 to 180 degrees)
  // 0 score = 0 degrees (left)
  // 100 score = 180 degrees (right)
  const rotation = (clampedScore / 100) * 180;

  // Segment definitions
  const segments = [
    { color: '#22c55e', label: 'VERY LOW', range: [0, 20] },   // Green
    { color: '#84cc16', label: 'LOW', range: [20, 40] },      // Lime
    { color: '#eab308', label: 'MEDIUM', range: [40, 60] },   // Yellow
    { color: '#f97316', label: 'HIGH', range: [60, 80] },     // Orange
    { color: '#ef4444', label: 'CRITICAL', range: [80, 100] } // Red
  ];

  // SVG parameters
  const width = 300;
  const height = 160; // Semi-circle height + padding
  const cx = 150;
  const cy = 140;
  const radius = 100;
  const innerRadius = 60;

  // Helper to calculate path for a segment
  const createSegmentPath = (startAngle: number, endAngle: number) => {
    // Convert degrees to radians (subtract 180 because SVG coordinates start from 3 o'clock)
    const startRad = (startAngle - 180) * (Math.PI / 180);
    const endRad = (endAngle - 180) * (Math.PI / 180);

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const x3 = cx + innerRadius * Math.cos(endRad);
    const y3 = cy + innerRadius * Math.sin(endRad);
    const x4 = cx + innerRadius * Math.cos(startRad);
    const y4 = cy + innerRadius * Math.sin(startRad);

    return `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 w-full max-w-md mx-auto">
      <h3 className="text-lg font-bold text-gray-700 dark:text-slate-200 mb-2 tracking-wider">RISK METER</h3>
      
      <div className="relative" style={{ width: width, height: height }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Segments */}
          {segments.map((segment, index) => {
            const segmentWidth = 180 / segments.length;
            const startAngle = index * segmentWidth;
            const endAngle = (index + 1) * segmentWidth;
            
            return (
              <g key={index}>
                <path
                  d={createSegmentPath(startAngle, endAngle)}
                  fill={segment.color}
                  stroke="white"
                  strokeWidth="2"
                  className="transition-all duration-300 hover:opacity-90"
                />
              </g>
            );
          })}

          {/* Needle */}
          <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            {/* Needle body */}
            <path d={`M ${cx - 4} ${cy} L ${cx} ${cy - radius + 10} L ${cx + 4} ${cy} Z`} className="fill-gray-700 dark:fill-gray-200" />
            {/* Center pivot */}
            <circle cx={cx} cy={cy} r="8" className="fill-gray-700 dark:fill-gray-200" stroke="white" strokeWidth="2" />
          </g>
        </svg>

        {/* Labels positioned absolutely for better control than SVG text */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
           <span className="absolute text-[10px] font-bold text-gray-500 dark:text-gray-400" style={{ left: '20px', bottom: '40px', transform: 'rotate(-72deg)' }}>VERY LOW</span>
           <span className="absolute text-[10px] font-bold text-gray-500 dark:text-gray-400" style={{ left: '60px', top: '50px', transform: 'rotate(-36deg)' }}>LOW</span>
           <span className="absolute text-[10px] font-bold text-gray-500 dark:text-gray-400" style={{ left: '130px', top: '20px' }}>MEDIUM</span>
           <span className="absolute text-[10px] font-bold text-gray-500 dark:text-gray-400" style={{ right: '60px', top: '50px', transform: 'rotate(36deg)' }}>HIGH</span>
           <span className="absolute text-[10px] font-bold text-gray-500 dark:text-gray-400" style={{ right: '20px', bottom: '40px', transform: 'rotate(72deg)' }}>CRITICAL</span>
        </div>
      </div>

      <div className="mt-[-20px] text-center">
        <div className="text-2xl font-bold text-gray-800 dark:text-white">
          {level || segments[Math.min(Math.floor(clampedScore / 20), 4)].label}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Risk Score: {Math.round(clampedScore)}/100</div>
      </div>
    </div>
  );
};

export default RiskMeter;
