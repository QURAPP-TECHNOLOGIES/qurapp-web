import { motion } from "framer-motion";

export const WorldMapSilhouette = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      <motion.svg
        viewBox="0 0 1000 500"
        className="w-full h-auto max-h-[85vh] opacity-25 dark:opacity-15"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ duration: 1.8 }}
      >
        <defs>
          <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity="0.5" />
            <stop offset="50%" stopColor="hsl(var(--gold))" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* North America */}
        <motion.path
          d="M 50,110 L 80,95 L 140,80 L 170,85 L 180,75 L 210,85 L 240,90 L 220,115 L 230,135 L 220,145 L 240,165 L 205,175 L 175,200 L 170,225 L 160,250 L 152,250 L 152,225 L 158,205 L 140,195 L 128,190 L 115,195 L 105,180 L 98,188 L 92,175 L 75,170 L 68,160 L 52,148 Z"
          fill="url(#mapGradient)"
          animate={{ opacity: [0.6, 0.75, 0.6] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* South America */}
        <motion.path
          d="M 160,250 L 172,252 L 185,270 L 200,285 L 218,295 L 245,310 L 255,330 L 248,360 L 235,385 L 215,415 L 202,442 L 195,465 L 188,465 L 180,440 L 172,400 L 168,360 L 160,335 L 152,310 L 150,285 L 155,265 Z"
          fill="url(#mapGradient)"
          animate={{ opacity: [0.55, 0.7, 0.55] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        
        {/* Greenland */}
        <motion.path
          d="M 230,50 L 275,40 L 305,45 L 290,75 L 265,95 L 240,90 L 222,70 Z"
          fill="url(#mapGradient)"
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.0 }}
        />

        {/* Africa */}
        <motion.path
          d="M 410,155 L 450,145 L 485,148 L 520,158 L 538,162 L 535,178 L 545,190 L 575,202 L 598,218 L 610,230 L 595,255 L 585,278 L 572,305 L 555,340 L 532,370 L 510,392 L 498,392 L 495,372 L 478,348 L 470,320 L 468,295 L 452,282 L 430,278 L 408,260 L 398,235 L 392,205 L 395,182 L 402,168 Z"
          fill="url(#mapGradient)"
          animate={{ opacity: [0.65, 0.8, 0.65] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />

        {/* Eurasia */}
        <motion.path
          d="M 380,150 L 388,138 L 395,120 L 410,122 L 415,110 L 430,105 L 435,92 L 428,82 L 440,70 L 452,58 L 472,48 L 485,55 L 468,75 L 482,88 L 498,90 L 510,75 L 532,70 L 550,60 L 590,52 L 640,48 L 720,48 L 810,50 L 870,62 L 910,75 L 920,95 L 900,110 L 892,128 L 905,145 L 890,165 L 868,172 L 852,195 L 838,212 L 815,225 L 795,210 L 782,235 L 770,265 L 755,260 L 748,238 L 735,228 L 718,228 L 702,238 L 688,252 L 672,268 L 655,272 L 645,250 L 652,228 L 638,222 L 610,230 L 590,225 L 575,215 L 558,218 L 545,210 L 545,190 L 530,180 L 512,185 L 492,180 L 475,170 L 458,175 L 442,168 L 420,165 Z"
          fill="url(#mapGradient)"
          animate={{ opacity: [0.7, 0.85, 0.7] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
        />

        {/* Australia */}
        <motion.path
          d="M 780,390 L 812,375 L 835,372 L 865,385 L 890,398 L 895,422 L 880,448 L 860,465 L 825,472 L 800,468 L 778,445 L 770,418 Z"
          fill="url(#mapGradient)"
          animate={{ opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
        />

        {/* Great Britain & Ireland */}
        <motion.path
          d="M 370,82 L 382,78 L 388,92 L 378,105 L 368,98 Z"
          fill="url(#mapGradient)"
          animate={{ opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        />

        {/* Japan */}
        <motion.path
          d="M 902,150 L 912,168 L 905,188 L 892,198 L 888,180 Z"
          fill="url(#mapGradient)"
          animate={{ opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
        />

        {/* Madagascar */}
        <motion.path
          d="M 585,320 L 595,310 L 602,332 L 592,355 L 580,342 Z"
          fill="url(#mapGradient)"
          animate={{ opacity: [0.45, 0.6, 0.45] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
      </motion.svg>
    </div>
  );
};
