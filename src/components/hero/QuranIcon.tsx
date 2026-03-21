import { motion } from "framer-motion";

export const QuranIcon = () => {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      {/* Central glow effect */}
      <motion.div
        className="absolute -inset-24 rounded-full bg-gradient-radial from-gold/30 via-gold/10 to-transparent blur-2xl"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Inner glow */}
      <motion.div
        className="absolute -inset-12 rounded-full bg-gold/20 blur-xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Quran on stand icon - matching reference design */}
      <motion.svg
        width="120"
        height="100"
        viewBox="0 0 120 100"
        className="relative z-10"
        animate={{
          y: [0, -3, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Left page */}
        <motion.path
          d="M60 20 Q35 25 25 50 Q35 55 60 50 Z"
          fill="hsl(var(--gold))"
          opacity="0.9"
          animate={{
            opacity: [0.85, 1, 0.85],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Right page */}
        <motion.path
          d="M60 20 Q85 25 95 50 Q85 55 60 50 Z"
          fill="hsl(var(--gold))"
          opacity="0.9"
          animate={{
            opacity: [0.85, 1, 0.85],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
        
        {/* Book spine */}
        <path
          d="M58 20 L58 52 L62 52 L62 20 Z"
          fill="hsl(var(--gold))"
          opacity="0.7"
        />
        
        {/* Stand - left leg */}
        <path
          d="M45 55 L55 85 L60 85 L52 55 Z"
          fill="hsl(var(--gold))"
          opacity="0.85"
        />
        
        {/* Stand - right leg */}
        <path
          d="M75 55 L65 85 L60 85 L68 55 Z"
          fill="hsl(var(--gold))"
          opacity="0.85"
        />
        
        {/* Stand cross bar */}
        <path
          d="M48 68 L72 68 L70 72 L50 72 Z"
          fill="hsl(var(--gold))"
          opacity="0.7"
        />
      </motion.svg>
    </motion.div>
  );
};
