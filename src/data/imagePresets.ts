// High-fidelity SVG-based data URIs for civic infrastructure photos (resilient, no broken external URLs)

function createSvgDataUri(svgContent: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
}

export const CIVIC_PRESET_PHOTOS = {
  pothole_before: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
      <defs>
        <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#334155" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
        <radialGradient id="holeGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#090d16" />
          <stop offset="60%" stop-color="#182030" />
          <stop offset="100%" stop-color="#334155" />
        </radialGradient>
      </defs>
      <rect width="600" height="450" fill="url(#roadGrad)"/>
      <!-- Road markings -->
      <line x1="300" y1="0" x2="300" y2="120" stroke="#facc15" stroke-width="12" stroke-dasharray="30 20"/>
      <line x1="300" y1="340" x2="300" y2="450" stroke="#facc15" stroke-width="12" stroke-dasharray="30 20"/>
      <!-- Asphalt texture cracks -->
      <path d="M 120 180 L 190 220 L 260 210 L 320 280 L 390 250 L 480 310" stroke="#0f172a" stroke-width="4" fill="none" opacity="0.8"/>
      <path d="M 210 215 L 230 160 L 290 140" stroke="#0f172a" stroke-width="3" fill="none" opacity="0.7"/>
      <path d="M 330 270 L 370 330 L 410 360" stroke="#0f172a" stroke-width="3" fill="none" opacity="0.7"/>
      <!-- Deep Pothole crater -->
      <ellipse cx="290" cy="240" rx="140" ry="85" fill="url(#holeGrad)"/>
      <path d="M 180 230 Q 230 170 340 180 Q 420 220 400 270 Q 350 320 250 310 Q 170 290 180 230 Z" fill="#0b0f19"/>
      <!-- Gravel and loose stones -->
      <circle cx="240" cy="230" r="7" fill="#64748b"/>
      <circle cx="320" cy="250" r="11" fill="#475569"/>
      <circle cx="280" cy="280" r="9" fill="#94a3b8"/>
      <circle cx="360" cy="220" r="6" fill="#cbd5e1"/>
      <circle cx="210" cy="260" r="8" fill="#64748b"/>
      <!-- Water puddle reflection in hole -->
      <ellipse cx="285" cy="260" rx="70" ry="25" fill="#1e293b" opacity="0.85"/>
      <ellipse cx="275" cy="255" rx="35" ry="12" fill="#38bdf8" opacity="0.25"/>
      <!-- Inspection overlay tag -->
      <rect x="20" y="20" width="160" height="32" rx="6" fill="#0f172a" opacity="0.85"/>
      <text x="32" y="41" fill="#ef4444" font-family="monospace" font-size="12" font-weight="bold">DAMAGED PAVEMENT</text>
    </svg>
  `),

  pothole_after: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
      <defs>
        <linearGradient id="newRoadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#334155" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
        <linearGradient id="freshPatchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e293b" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
      </defs>
      <rect width="600" height="450" fill="url(#newRoadGrad)"/>
      <!-- Fresh blacktop patch -->
      <path d="M 150 160 L 430 150 L 450 330 L 130 340 Z" rx="16" fill="url(#freshPatchGrad)" stroke="#475569" stroke-width="2"/>
      <!-- Seamless asphalt compaction lines -->
      <line x1="160" y1="200" x2="420" y2="195" stroke="#334155" stroke-width="1.5" stroke-dasharray="10 5"/>
      <line x1="150" y1="250" x2="430" y2="245" stroke="#334155" stroke-width="1.5" stroke-dasharray="10 5"/>
      <line x1="140" y1="300" x2="440" y2="295" stroke="#334155" stroke-width="1.5" stroke-dasharray="10 5"/>
      <!-- Repainted yellow lane marking right through the patch -->
      <line x1="300" y1="0" x2="300" y2="450" stroke="#facc15" stroke-width="12" stroke-dasharray="30 20"/>
      <!-- Verified stamp badge -->
      <rect x="20" y="20" width="165" height="32" rx="6" fill="#064e3b" opacity="0.9"/>
      <text x="32" y="41" fill="#34d399" font-family="monospace" font-size="12" font-weight="bold">REPAIRED &amp; SEALED</text>
    </svg>
  `),

  streetlight_before: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
      <rect width="600" height="450" fill="#0f172a"/>
      <!-- Evening dark sky -->
      <circle cx="500" cy="90" r="35" fill="#f8fafc" opacity="0.2"/>
      <!-- Sidewalk -->
      <polygon points="0,380 600,380 600,450 0,450" fill="#334155"/>
      <line x1="0" y1="380" x2="600" y2="380" stroke="#64748b" stroke-width="4"/>
      <!-- Street pole -->
      <rect x="280" y="100" width="20" height="280" fill="#64748b"/>
      <path d="M 280 120 C 280 60, 200 60, 180 80" stroke="#64748b" stroke-width="16" fill="none"/>
      <!-- Broken lantern fixture hanging -->
      <polygon points="150,80 210,80 195,130 165,130" fill="#334155" stroke="#94a3b8" stroke-width="2"/>
      <!-- Broken glass cracks -->
      <line x1="160" y1="90" x2="195" y2="120" stroke="#f87171" stroke-width="3"/>
      <line x1="190" y1="95" x2="170" y2="125" stroke="#f87171" stroke-width="2"/>
      <!-- Dangling wire with sparks -->
      <path d="M 180 130 Q 170 160 185 175" stroke="#e2e8f0" stroke-width="2" fill="none"/>
      <circle cx="185" cy="175" r="4" fill="#fbbf24"/>
      <!-- Dark area indicator -->
      <rect x="20" y="20" width="165" height="32" rx="6" fill="#0f172a" opacity="0.9"/>
      <text x="30" y="41" fill="#f87171" font-family="monospace" font-size="12" font-weight="bold">LIGHT OUT / DAMAGED</text>
    </svg>
  `),

  streetlight_after: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
      <rect width="600" height="450" fill="#090d16"/>
      <!-- Sidewalk -->
      <polygon points="0,380 600,380 600,450 0,450" fill="#334155"/>
      <!-- Street pole -->
      <rect x="280" y="100" width="20" height="280" fill="#64748b"/>
      <path d="M 280 120 C 280 60, 200 60, 180 80" stroke="#64748b" stroke-width="16" fill="none"/>
      <!-- Restored LED Luminaire fixture -->
      <polygon points="150,80 210,80 200,120 160,120" fill="#475569"/>
      <!-- Illuminating glow cone -->
      <polygon points="180,120 40,380 380,380" fill="#fef08a" opacity="0.3"/>
      <polygon points="180,120 100,380 290,380" fill="#fef08a" opacity="0.3"/>
      <!-- Bright LED center -->
      <ellipse cx="180" cy="120" rx="18" ry="8" fill="#ffffff"/>
      <!-- Ground illuminated pool -->
      <ellipse cx="210" cy="390" rx="150" ry="35" fill="#fef08a" opacity="0.4"/>
      <!-- Verified stamp badge -->
      <rect x="20" y="20" width="170" height="32" rx="6" fill="#064e3b" opacity="0.9"/>
      <text x="30" y="41" fill="#34d399" font-family="monospace" font-size="12" font-weight="bold">LED INSTALLED &amp; ACTIVE</text>
    </svg>
  `),

  garbage_before: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
      <rect width="600" height="450" fill="#e2e8f0"/>
      <!-- Concrete pavement ground -->
      <rect y="320" width="600" height="130" fill="#94a3b8"/>
      <!-- Concrete brick wall background -->
      <rect y="0" width="600" height="320" fill="#cbd5e1"/>
      <line x1="0" y1="120" x2="600" y2="120" stroke="#94a3b8" stroke-width="2"/>
      <line x1="0" y1="220" x2="600" y2="220" stroke="#94a3b8" stroke-width="2"/>
      <!-- Municipal Green Dumpster overflowing -->
      <rect x="200" y="190" width="200" height="150" rx="8" fill="#15803d"/>
      <rect x="190" y="175" width="220" height="20" rx="4" fill="#166534"/>
      <!-- Garbage bags spilling over top and side -->
      <ellipse cx="240" cy="165" rx="35" ry="30" fill="#0f172a"/>
      <ellipse cx="300" cy="155" rx="40" ry="32" fill="#334155"/>
      <ellipse cx="355" cy="170" rx="38" ry="28" fill="#1e293b"/>
      <ellipse cx="160" cy="330" rx="42" ry="26" fill="#0f172a"/>
      <ellipse cx="420" cy="335" rx="38" ry="25" fill="#334155"/>
      <polygon points="180,310 215,290 220,335 175,340" fill="#ea580c"/>
      <polygon points="380,310 410,285 435,320 390,345" fill="#ca8a04"/>
      <!-- Bad odor lines -->
      <path d="M 230 110 Q 240 85 225 65" stroke="#84cc16" stroke-width="3" fill="none" opacity="0.6"/>
      <path d="M 310 100 Q 300 75 320 50" stroke="#84cc16" stroke-width="3" fill="none" opacity="0.6"/>
      <!-- Inspection overlay tag -->
      <rect x="20" y="20" width="165" height="32" rx="6" fill="#0f172a" opacity="0.85"/>
      <text x="30" y="41" fill="#f97316" font-family="monospace" font-size="12" font-weight="bold">OVERFLOWING DUMPSTER</text>
    </svg>
  `),

  garbage_after: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
      <rect width="600" height="450" fill="#f1f5f9"/>
      <!-- Clean pavement -->
      <rect y="320" width="600" height="130" fill="#94a3b8"/>
      <!-- Clean wall background -->
      <rect y="0" width="600" height="320" fill="#e2e8f0"/>
      <!-- Clean green municipal dumpster, lid closed neatly -->
      <rect x="200" y="190" width="200" height="150" rx="8" fill="#15803d"/>
      <rect x="185" y="175" width="230" height="20" rx="4" fill="#166534"/>
      <!-- Wheels -->
      <circle cx="230" cy="345" r="14" fill="#1e293b"/>
      <circle cx="370" cy="345" r="14" fill="#1e293b"/>
      <!-- Clean ground, swept clean -->
      <line x1="100" y1="360" x2="500" y2="360" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="15 15"/>
      <!-- Verified stamp badge -->
      <rect x="20" y="20" width="170" height="32" rx="6" fill="#064e3b" opacity="0.9"/>
      <text x="30" y="41" fill="#34d399" font-family="monospace" font-size="12" font-weight="bold">SANITIZED &amp; CLEARED</text>
    </svg>
  `),

  water_leak_before: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
      <rect width="600" height="450" fill="#334155"/>
      <!-- Sidewalk curb and asphalt road -->
      <rect y="220" width="600" height="230" fill="#1e293b"/>
      <line x1="0" y1="220" x2="600" y2="220" stroke="#64748b" stroke-width="8"/>
      <!-- Water valve inspection cover burst open -->
      <ellipse cx="300" cy="270" rx="55" ry="30" fill="#0f172a" stroke="#475569" stroke-width="6"/>
      <!-- Water geyser / gushing spray -->
      <path d="M 270 270 Q 300 120 310 90 Q 320 120 330 270 Z" fill="#38bdf8" opacity="0.8"/>
      <ellipse cx="300" cy="90" rx="35" ry="15" fill="#7dd3fc" opacity="0.9"/>
      <!-- Water flooding street -->
      <ellipse cx="300" cy="340" rx="190" ry="60" fill="#0284c7" opacity="0.5"/>
      <ellipse cx="290" cy="335" rx="140" ry="40" fill="#38bdf8" opacity="0.4"/>
      <!-- Bubbles and ripples -->
      <circle cx="240" cy="330" r="15" stroke="#bae6fd" stroke-width="2" fill="none" opacity="0.6"/>
      <circle cx="360" cy="350" r="22" stroke="#bae6fd" stroke-width="2" fill="none" opacity="0.5"/>
      <!-- Inspection overlay tag -->
      <rect x="20" y="20" width="165" height="32" rx="6" fill="#0f172a" opacity="0.85"/>
      <text x="30" y="41" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="bold">MAIN PIPE LEAK</text>
    </svg>
  `),

  water_leak_after: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
      <rect width="600" height="450" fill="#334155"/>
      <!-- Sidewalk curb and asphalt road dry -->
      <rect y="220" width="600" height="230" fill="#1e293b"/>
      <line x1="0" y1="220" x2="600" y2="220" stroke="#64748b" stroke-width="8"/>
      <!-- Secure iron valve hatch tightly bolted shut -->
      <ellipse cx="300" cy="270" rx="55" ry="30" fill="#1e293b" stroke="#3b82f6" stroke-width="6"/>
      <line x1="270" y1="270" x2="330" y2="270" stroke="#94a3b8" stroke-width="4"/>
      <line x1="300" y1="250" x2="300" y2="290" stroke="#94a3b8" stroke-width="4"/>
      <!-- Dry road surface -->
      <text x="260" y="360" fill="#64748b" font-family="sans-serif" font-size="14">Dry Surface · Sealed</text>
      <!-- Verified stamp badge -->
      <rect x="20" y="20" width="170" height="32" rx="6" fill="#064e3b" opacity="0.9"/>
      <text x="30" y="41" fill="#34d399" font-family="monospace" font-size="12" font-weight="bold">VALVE REPLACED</text>
    </svg>
  `)
};
