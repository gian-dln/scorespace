import type { CSSProperties } from "react";

const WIDTH = 1200;
const HEIGHT = 150;
const BASE_Y = 78;
const AMP = 15; /* how far the ribbon swells */
const WAVELENGTH = 540;
const GAP = 9; /* distance between stave lines */
const STEP = 4.5; /* half a stave space — one pitch step */

/** Vertical position of the ribbon at x, for a line sitting `offset` from its centre. */
function waveY(x: number, offset: number, ampScale = 1): number {
  return BASE_Y + offset + AMP * ampScale * Math.sin((2 * Math.PI * x) / WAVELENGTH);
}

/** A stave line, sampled along the sine. It is drawn a full wavelength beyond
 *  each edge so the line can be slid sideways by exactly one wavelength and
 *  land on an identical shape — which is what makes the travel seamless and
 *  lets it run on `linear` timing with no stop at either end. */
function wavePath(offset: number, ampScale: number): string {
  const points: string[] = [];
  for (let x = -WAVELENGTH; x <= WIDTH + WAVELENGTH; x += 8) {
    points.push(`${x === -WAVELENGTH ? "M" : "L"}${x} ${waveY(x, offset, ampScale).toFixed(2)}`);
  }
  return points.join(" ");
}

/** Every line gets its own travel and drift period. The durations share no
 *  common factor, so the lines pull apart continuously instead of settling
 *  back into step the way a shared duration with staggered delays would. */
const LINES = [
  { offset: -2 * GAP, amp: 1.0, travel: "13s", drift: "8.5s", driftPx: "5px", delay: "-2.1s" },
  { offset: -1 * GAP, amp: 1.06, travel: "13.7s", drift: "10.2s", driftPx: "-4px", delay: "-5.4s" },
  { offset: 0, amp: 0.95, travel: "12.6s", drift: "9.1s", driftPx: "6px", delay: "-0.8s" },
  { offset: 1 * GAP, amp: 1.03, travel: "14.2s", drift: "11.4s", driftPx: "-5px", delay: "-3.6s" },
  { offset: 2 * GAP, amp: 0.98, travel: "13.3s", drift: "8.8s", driftPx: "4px", delay: "-6.2s" },
];

/** Notes riding the ribbon. `pitch` is in half-spaces from the middle line.
 *  Durations and delays are hand-picked rather than random so the server and
 *  client render identically — random values would cause a hydration mismatch.
 *  Negative delays start each note mid-bounce, so nothing begins at rest. */
const NOTES: {
  x: number;
  pitch: number;
  glyph: string;
  size: number;
  dur: string;
  delay: string;
}[] = [
  { x: 196, pitch: -2, glyph: "♪", size: 27, dur: "2.4s", delay: "-0.7s" },
  { x: 252, pitch: 2, glyph: "♫", size: 25, dur: "3.1s", delay: "-1.9s" },
  { x: 330, pitch: -4, glyph: "♩", size: 26, dur: "2.7s", delay: "-0.2s" },
  { x: 398, pitch: 1, glyph: "♬", size: 25, dur: "2.05s", delay: "-1.4s" },
  { x: 470, pitch: -3, glyph: "♪", size: 27, dur: "3.4s", delay: "-2.6s" },
  { x: 546, pitch: 3, glyph: "♫", size: 25, dur: "2.25s", delay: "-0.9s" },
  { x: 622, pitch: -1, glyph: "♪", size: 26, dur: "2.95s", delay: "-2.2s" },
  { x: 700, pitch: -5, glyph: "♬", size: 25, dur: "2.5s", delay: "-0.4s" },
  { x: 774, pitch: 2, glyph: "♩", size: 26, dur: "3.25s", delay: "-1.7s" },
  { x: 846, pitch: -2, glyph: "♫", size: 25, dur: "2.15s", delay: "-2.9s" },
  { x: 926, pitch: 4, glyph: "♪", size: 27, dur: "2.8s", delay: "-1.1s" },
  { x: 1002, pitch: -3, glyph: "♬", size: 25, dur: "3.05s", delay: "-0.5s" },
  { x: 1078, pitch: 1, glyph: "♪", size: 26, dur: "2.35s", delay: "-2.4s" },
  { x: 1146, pitch: -2, glyph: "♫", size: 25, dur: "2.65s", delay: "-1.6s" },
];

export function ScoreFlourish({ busy = false }: { busy?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden ${busy ? "flourish-busy" : ""}`}
      {...(busy ? { role: "status", "aria-label": "Searching the catalogue" } : { "aria-hidden": true })}
    >
      {/* On narrow screens the ribbon is cropped rather than scaled down, so
          the clef and noteheads stay legible instead of shrinking to specks. */}
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMinYMid slice"
        className="h-[76px] w-full sm:h-[106px]"
        fill="none"
      >
        {/* Each line drifts vertically while its wave travels sideways — two
            unrelated periods stacked, so the ribbon reads as a live signal. */}
        {LINES.map((line) => (
          <g
            key={line.offset}
            className="flourish-drift"
            style={{ "--drift-dur": line.drift, "--drift": line.driftPx, "--delay": line.delay } as CSSProperties}
          >
            <g
              className="flourish-travel"
              style={{ "--travel-dur": line.travel, "--wave": `${WAVELENGTH}px` } as CSSProperties}
            >
              <path
                d={wavePath(line.offset, line.amp)}
                stroke="var(--steel)"
                strokeOpacity={0.55}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          </g>
        ))}

        {/* clef — tilts and swells on its own rhythm */}
        <g className="flourish-clef" style={{ "--clef-dur": "5.2s" } as CSSProperties}>
          <text
            x={96}
            y={waveY(96, 0) + 24}
            textAnchor="middle"
            fill="var(--ink)"
            style={{ fontFamily: "var(--font-music)", fontSize: 86 }}
          >
            𝄞
          </text>
        </g>

        {/* notes — each on its own period, so they never fall into step */}
        {NOTES.map((note) => (
          <g
            key={note.x}
            className="flourish-note"
            style={{ "--note-dur": note.dur, "--delay": note.delay } as CSSProperties}
          >
            <text
              x={note.x}
              y={waveY(note.x, note.pitch * STEP)}
              textAnchor="middle"
              fill="var(--ink)"
              fillOpacity={0.9}
              style={{ fontFamily: "var(--font-music)", fontSize: note.size }}
            >
              {note.glyph}
            </text>
          </g>
        ))}
      </svg>

      {/* chrome playhead — only while a search is running, so the wait reads
          as forward motion rather than an idle loop */}
      {busy && (
        <span
          aria-hidden
          className="flourish-sweep pointer-events-none absolute inset-y-0 w-[14%]"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(240,242,246,0.30), transparent)",
          }}
        />
      )}
    </div>
  );
}
