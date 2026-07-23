import type { CSSProperties } from "react";

/**
 * The home hero: an inked musical flourish. A five-line stave sweeps across,
 * beamed and flagged notes ride it, and the treble clef fades in — then the
 * whole thing is left gently alive.
 *
 * The clef is the real Noto Music G-clef (SIL OFL); the stave and notes are
 * drawn geometry. Pure SVG + CSS: plays once on load, scales by viewBox,
 * collapses to the finished still under prefers-reduced-motion.
 */

// Real Noto Music treble clef, font units (em 1000, y-up), placed via a
// flipping transform below.
const CLEF =
  "M314 801Q300 854 291 906Q282 958 282 1012Q282 1059 288 1100Q295 1142 307 1177Q320 1217 341 1252Q362 1288 386 1311Q409 1334 427 1334Q451 1334 493 1249Q514 1206 524 1156Q534 1106 534 1049Q534 978 515 908Q496 837 460 775Q423 713 372 666L407 498Q422 500 432 501Q442 502 447 502Q508 502 556 468Q604 433 632 377Q661 321 661 254Q661 177 622 116Q582 54 503 25Q508 8 532 -117Q538 -147 541 -164Q544 -182 545 -195Q546 -208 546 -225Q546 -275 522 -314Q497 -354 456 -376Q414 -398 363 -398Q311 -398 271 -378Q231 -359 208 -324Q185 -290 185 -245Q185 -197 212 -165Q238 -133 287 -133Q329 -133 356 -164Q382 -194 382 -236Q382 -272 357 -299Q332 -326 292 -326H282Q308 -365 364 -365Q433 -365 472 -320Q511 -275 511 -205Q511 -188 507 -160Q503 -131 493 -91Q483 -51 478 -25Q472 1 470 12Q436 2 390 2Q304 2 222 52Q142 102 96 184Q50 266 50 361Q50 451 91 530Q132 609 192 675Q253 741 314 801ZM341 826Q364 838 390 870Q416 903 440 945Q464 987 479 1030Q494 1072 494 1106Q494 1142 483 1163Q472 1184 445 1184Q421 1184 398 1162Q376 1140 358 1104Q341 1067 331 1022Q321 977 321 930Q321 898 328 872Q334 846 341 826ZM398 379Q371 373 347 354Q323 334 308 306Q294 279 294 248Q294 223 307 196Q320 170 339 154Q352 142 365 136Q380 129 380 123Q380 120 370 117Q332 126 302 151Q271 176 254 212Q236 247 236 287Q236 330 254 370Q271 410 302 442Q334 474 374 490L345 641Q229 547 174 456Q120 366 120 277Q120 212 154 156Q188 100 247 66Q306 31 380 31Q400 31 420 35Q441 39 464 45ZM495 55Q593 97 593 227Q593 270 571 306Q549 341 512 362Q475 383 429 383Z";

const n = (v: number) => v.toFixed(1);

const STAVE_X0 = 96;
const STAVE_X1 = 452;
const STAVE_TILT = -56; // the stave sweeps up to the right
const STAVE_AMP = 9;
const STAVE_WL = 320;

/** One stave line: a gentle sine sweep across the width, flowing off the
 *  right end. */
function staveLine(yBase: number): string {
  const pts: [number, number][] = [];
  for (let x = STAVE_X0; x <= STAVE_X1; x += 4) {
    const p = (x - STAVE_X0) / (STAVE_X1 - STAVE_X0);
    pts.push([x, yBase + STAVE_TILT * p + STAVE_AMP * Math.sin((2 * Math.PI * (x - STAVE_X0)) / STAVE_WL)]);
  }
  return "M" + pts.map((p) => `${n(p[0])} ${n(p[1])}`).join(" L ");
}

// Five flowing stave lines. Small, staggered delays so they ink in together
// rather than one after another.
const STAVE: { y: number; delay: number; opacity: number }[] = [
  { y: 130, delay: 0.14, opacity: 0.8 },
  { y: 140, delay: 0.22, opacity: 0.75 },
  { y: 150, delay: 0.3, opacity: 0.8 },
  { y: 160, delay: 0.2, opacity: 0.75 },
  { y: 170, delay: 0.28, opacity: 0.8 },
];

function drawStyle(delay: number, dur: number): CSSProperties {
  return { "--delay": `${delay}s`, "--dur": `${dur}s` } as CSSProperties;
}

const STROKE = "var(--ink)";

/** One flagged eighth note. The head fills in while a single continuous stroke
 *  — stem then flag — draws from *inside* the head upward, so the parts read as
 *  one connected note rather than separate marks. */
function EighthNote({
  hx,
  hy,
  t,
  driftDur,
  driftDelay,
}: {
  hx: number;
  hy: number;
  t: number;
  driftDur: string;
  driftDelay: string;
}) {
  const sx = hx + 5.5;
  const top = hy - 30;
  return (
    <g className="mg-drift" style={{ "--drift-dur": driftDur, "--drift-delay": driftDelay } as CSSProperties}>
      <ellipse
        className="mg-fill"
        cx={hx}
        cy={hy}
        rx={6.3}
        ry={4.6}
        fill={STROKE}
        transform={`rotate(-22 ${hx} ${hy})`}
        style={{ "--delay": `${t}s`, "--fdur": "0.45s" } as CSSProperties}
      />
      <path
        className="mg-line"
        d={`M${sx} ${hy} L${sx} ${top} C${sx + 11} ${top + 5}, ${sx + 13} ${top + 15}, ${sx + 5} ${top + 22}`}
        pathLength={1}
        fill="none"
        stroke={STROKE}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={drawStyle(t + 0.05, 0.6)}
      />
    </g>
  );
}

/** Two heads under a beam. Both stems and the beam are one continuous stroke
 *  drawn from head to head, so the pair is a single connected figure. */
function BeamedPair({ x, y, t, driftDur, driftDelay }: { x: number; y: number; t: number; driftDur: string; driftDelay: string }) {
  const gap = 22;
  const beamY = y - 30;
  const s1 = x + 5.5;
  const s2 = x + gap + 5.5;
  return (
    <g className="mg-drift" style={{ "--drift-dur": driftDur, "--drift-delay": driftDelay } as CSSProperties}>
      {[x, x + gap].map((hx, i) => (
        <ellipse
          key={i}
          className="mg-fill"
          cx={hx}
          cy={y}
          rx={6.3}
          ry={4.6}
          fill={STROKE}
          transform={`rotate(-22 ${hx} ${y})`}
          style={{ "--delay": `${t}s`, "--fdur": "0.45s" } as CSSProperties}
        />
      ))}
      <path
        className="mg-line"
        d={`M${s1} ${y} L${s1} ${beamY} L${s2} ${beamY - 3} L${s2} ${y}`}
        pathLength={1}
        fill="none"
        stroke={STROKE}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={drawStyle(t + 0.05, 0.7)}
      />
    </g>
  );
}

export function MusicalGrowth() {
  return (
    <div className="mg-scene w-full max-w-lg">
      <svg viewBox="0 0 480 230" className="w-full" fill="none" role="img" aria-label="An inked treble clef with a flourish of music">
        <g className="mg-glow">
          <g className="mg-idle" style={{ "--idle": "1.9s" } as CSSProperties}>
            {/* five stave lines */}
            {STAVE.map((line, i) => (
              <path
                key={i}
                className="mg-line"
                d={staveLine(line.y)}
                pathLength={1}
                stroke={STROKE}
                strokeWidth={1.3}
                strokeOpacity={line.opacity}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                style={drawStyle(line.delay, 1.2)}
              />
            ))}

            {/* notes on the stave — small staggers so they arrive together */}
            <BeamedPair x={188} y={116} t={0.5} driftDur="4.6s" driftDelay="2.0s" />
            <EighthNote hx={256} hy={132} t={0.65} driftDur="5.4s" driftDelay="2.2s" />
            <EighthNote hx={330} hy={112} t={0.8} driftDur="4.9s" driftDelay="2.1s" />
            <EighthNote hx={392} hy={128} t={0.95} driftDur="5.8s" driftDelay="2.3s" />

            {/* the clef — the real glyph, fading and settling in */}
            <g className="mg-clef-in">
              <g transform="translate(70 122) scale(0.0735 -0.0735) translate(-355.5 -468)">
                <path d={CLEF} fill={STROKE} stroke="none" />
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
