import { motion } from "framer-motion";

export const WorldMapSilhouette = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      <motion.svg
        viewBox="0 0 1000 500"
        className="w-full h-auto max-h-[80vh] opacity-20 dark:opacity-15"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 2 }}
      >
        <defs>
          {/* Noise texture for sandy effect */}
          <filter id="sandTexture">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="4"
              result="noise"
            />
            <feColorMatrix
              in="noise"
              type="saturate"
              values="0"
            />
            <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
          </filter>
          
          <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity="0.6" />
            <stop offset="50%" stopColor="hsl(var(--gold))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* North America */}
        <motion.path
          d="M50 120 Q80 100 150 110 Q200 90 230 100 Q250 120 240 150 Q220 180 200 200 Q180 220 150 230 Q120 220 100 200 Q70 180 60 150 Q50 130 50 120 Z"
          fill="url(#mapGradient)"
          filter="url(#sandTexture)"
          animate={{ opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Central America */}
        <motion.path
          d="M150 240 Q170 250 180 280 Q175 300 160 310 Q145 300 140 280 Q145 260 150 240 Z"
          fill="url(#mapGradient)"
          filter="url(#sandTexture)"
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        
        {/* South America */}
        <motion.path
          d="M180 320 Q210 310 230 340 Q240 380 230 420 Q210 450 180 460 Q150 450 140 420 Q130 380 150 340 Q160 320 180 320 Z"
          fill="url(#mapGradient)"
          filter="url(#sandTexture)"
          animate={{ opacity: [0.5, 0.65, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        
        {/* Europe */}
        <motion.path
          d="M420 80 Q460 70 500 80 Q530 90 540 110 Q530 130 500 140 Q470 150 440 140 Q410 130 400 110 Q410 90 420 80 Z"
          fill="url(#mapGradient)"
          filter="url(#sandTexture)"
          animate={{ opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        
        {/* Africa */}
        <motion.path
          d="M440 180 Q480 160 520 180 Q550 220 560 280 Q550 340 520 380 Q480 400 450 390 Q420 370 410 320 Q400 260 420 210 Q430 190 440 180 Z"
          fill="url(#mapGradient)"
          filter="url(#sandTexture)"
          animate={{ opacity: [0.55, 0.75, 0.55] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
        />
        
        {/* Middle East - highlighted center region */}
        <motion.path
          d="M540 160 Q580 150 610 170 Q630 200 620 230 Q600 250 570 250 Q540 240 530 210 Q530 180 540 160 Z"
          fill="hsl(var(--gold))"
          opacity="0.4"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Russia/Northern Asia */}
        <motion.path
          d="M560 60 Q650 50 750 60 Q850 70 900 90 Q920 110 900 130 Q850 140 750 130 Q650 120 580 110 Q550 100 550 80 Q555 65 560 60 Z"
          fill="url(#mapGradient)"
          filter="url(#sandTexture)"
          animate={{ opacity: [0.45, 0.6, 0.45] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
        
        {/* India */}
        <motion.path
          d="M640 200 Q680 190 700 220 Q710 260 690 300 Q660 320 640 300 Q620 270 630 230 Q635 210 640 200 Z"
          fill="url(#mapGradient)"
          filter="url(#sandTexture)"
          animate={{ opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        />
        
        {/* China */}
        <motion.path
          d="M720 140 Q780 130 830 150 Q860 180 850 220 Q820 250 770 250 Q720 240 700 210 Q690 170 720 140 Z"
          fill="url(#mapGradient)"
          filter="url(#sandTexture)"
          animate={{ opacity: [0.5, 0.65, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
        
        {/* Southeast Asia */}
        <motion.path
          d="M760 280 Q800 270 830 290 Q850 320 840 350 Q810 370 780 360 Q750 340 755 310 Q758 290 760 280 Z"
          fill="url(#mapGradient)"
          filter="url(#sandTexture)"
          animate={{ opacity: [0.45, 0.6, 0.45] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        />
        
        {/* Japan */}
        <motion.path
          d="M880 160 Q900 150 910 170 Q915 200 900 220 Q885 225 875 210 Q870 180 880 160 Z"
          fill="url(#mapGradient)"
          filter="url(#sandTexture)"
          animate={{ opacity: [0.4, 0.55, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />
        
        {/* Australia */}
        <motion.path
          d="M800 380 Q860 370 900 400 Q920 440 900 470 Q850 490 800 480 Q760 460 770 420 Q780 390 800 380 Z"
          fill="url(#mapGradient)"
          filter="url(#sandTexture)"
          animate={{ opacity: [0.5, 0.65, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />

        {/* Greenland */}
        <motion.path
          d="M280 50 Q320 40 350 55 Q365 75 350 95 Q320 105 290 95 Q270 80 280 50 Z"
          fill="url(#mapGradient)"
          filter="url(#sandTexture)"
          animate={{ opacity: [0.35, 0.5, 0.35] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
        />
      </motion.svg>
    </div>
  );
};
