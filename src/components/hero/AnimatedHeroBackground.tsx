import { motion } from "framer-motion";
import { WorldMapSilhouette } from "./WorldMapSilhouette";
import { ConnectionLines } from "./ConnectionLines";
import { QuranIcon } from "./QuranIcon";

const AnimatedHeroBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Clean white/cream background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(45,30%,98%)] via-[hsl(40,25%,96%)] to-[hsl(35,20%,94%)] dark:from-[hsl(30,10%,10%)] dark:via-[hsl(25,8%,8%)] dark:to-[hsl(20,6%,6%)]" />
      
      {/* Subtle radial glow from center */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-gradient-radial from-gold/10 via-gold/5 to-transparent blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* World map silhouette layer */}
      <WorldMapSilhouette />

      {/* Connection lines layer */}
      <ConnectionLines />

      {/* Central Quran icon */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <QuranIcon />
      </div>
    </div>
  );
};

export default AnimatedHeroBackground;
