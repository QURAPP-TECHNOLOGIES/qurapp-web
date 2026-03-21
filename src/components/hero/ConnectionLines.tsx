import { motion } from "framer-motion";

// Curved arc connections from center to global points - matching reference style
const connections = [
  // To North America
  { endX: 20, endY: 40, curveDirection: "up", delay: 0 },
  { endX: 15, endY: 55, curveDirection: "down", delay: 1.5 },
  // To South America
  { endX: 28, endY: 70, curveDirection: "down", delay: 0.8 },
  { endX: 25, endY: 80, curveDirection: "down", delay: 2.2 },
  // To Europe
  { endX: 48, endY: 28, curveDirection: "up", delay: 0.3 },
  { endX: 42, endY: 35, curveDirection: "up", delay: 1.8 },
  // To East Asia
  { endX: 80, endY: 35, curveDirection: "up", delay: 0.5 },
  { endX: 85, endY: 42, curveDirection: "up", delay: 1.2 },
  // To South Asia
  { endX: 72, endY: 48, curveDirection: "down", delay: 0.7 },
  // To Southeast Asia
  { endX: 82, endY: 58, curveDirection: "down", delay: 1.0 },
  { endX: 88, endY: 65, curveDirection: "down", delay: 2.0 },
  // To Africa
  { endX: 52, endY: 65, curveDirection: "down", delay: 1.4 },
  { endX: 48, endY: 75, curveDirection: "down", delay: 2.5 },
  // To Australia
  { endX: 85, endY: 78, curveDirection: "down", delay: 1.6 },
];

// Center point (Middle East region)
const centerX = 55;
const centerY = 45;

export const ConnectionLines = () => {
  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none" 
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity="0.1" />
          <stop offset="50%" stopColor="hsl(var(--gold))" stopOpacity="0.6" />
          <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity="0.1" />
        </linearGradient>
        <filter id="arcGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {connections.map((connection, index) => {
        // Calculate curved path - create elegant arcs like in the reference
        const midX = (centerX + connection.endX) / 2;
        const distance = Math.sqrt(
          Math.pow(connection.endX - centerX, 2) + 
          Math.pow(connection.endY - centerY, 2)
        );
        const curveIntensity = distance * 0.4;
        const controlY = connection.curveDirection === "up" 
          ? Math.min(centerY, connection.endY) - curveIntensity
          : Math.max(centerY, connection.endY) + curveIntensity;

        return (
          <motion.path
            key={index}
            d={`M ${centerX} ${centerY} Q ${midX} ${controlY} ${connection.endX} ${connection.endY}`}
            fill="none"
            stroke="url(#arcGradient)"
            strokeWidth="0.3"
            filter="url(#arcGlow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 1, 0],
              opacity: [0, 0.8, 0.8, 0],
            }}
            transition={{
              duration: 10,
              delay: connection.delay * 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.35, 0.65, 1],
            }}
          />
        );
      })}

      {/* Small glowing dots at connection endpoints */}
      {connections.map((connection, index) => (
        <motion.circle
          key={`dot-${index}`}
          cx={connection.endX}
          cy={connection.endY}
          r="0.8"
          fill="hsl(var(--gold))"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.8, 0.8, 0],
            scale: [0, 1, 1, 0],
          }}
          transition={{
            duration: 10,
            delay: connection.delay * 1.5 + 2,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.2, 0.8, 1],
          }}
        />
      ))}

      {/* Central radiating lines - subtle rays from center */}
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const endX = centerX + Math.cos(angle) * 8;
        const endY = centerY + Math.sin(angle) * 8;
        
        return (
          <motion.line
            key={`ray-${i}`}
            x1={centerX}
            y1={centerY}
            x2={endX}
            y2={endY}
            stroke="hsl(var(--gold))"
            strokeWidth="0.2"
            strokeOpacity="0.3"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: 4,
              delay: i * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </svg>
  );
};
