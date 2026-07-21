const WIDTH = 1200;
const HEIGHT = 150;
const BASE_Y = 78;
const AMP = 15; /* how far the ribbon swells */
const WAVELENGTH = 540;
const GAP = 9; /* distance between stave lines */
const STEP = 4.5; /* half a stave space — one pitch step */

/** Vertical position of the ribbon at x, for a line sitting `offset` from its centre. */
function waveY(x: number, offset: number): number {
  return BASE_Y + offset + AMP * Math.sin((2 * Math.PI * x) / WAVELENGTH);
}

/** A stave line, sampled along the sine so the notes can be placed on the
 *  exact same curve rather than approximated against it. */
function wavePath(offset: number): string {
  const points: string[] = [];
  for (let x = 0; x <= WIDTH; x += 10) {
    points.push(`${x === 0 ? "M" : "L"}${x} ${waveY(x, offset).toFixed(2)}`);
  }
  return points.join(" ");
}

const LINE_OFFSETS = [-2, -1, 0, 1, 2].map((i) => i * GAP);

/** Notes riding the ribbon. `pitch` is in half-spaces from the middle line,
 *  so every note lands cleanly on a line or in a space. */
const NOTES: { x: number; pitch: number; glyph: string; size: number }[] = [
  { x: 196, pitch: -2, glyph: "♪", size: 27 },
  { x: 252, pitch: 2, glyph: "♫", size: 25 },
  { x: 330, pitch: -4, glyph: "♩", size: 26 },
  { x: 398, pitch: 1, glyph: "♬", size: 25 },
  { x: 470, pitch: -3, glyph: "♪", size: 27 },
  { x: 546, pitch: 3, glyph: "♫", size: 25 },
  { x: 622, pitch: -1, glyph: "♪", size: 26 },
  { x: 700, pitch: -5, glyph: "♬", size: 25 },
  { x: 774, pitch: 2, glyph: "♩", size: 26 },
  { x: 846, pitch: -2, glyph: "♫", size: 25 },
  { x: 926, pitch: 4, glyph: "♪", size: 27 },
  { x: 1002, pitch: -3, glyph: "♬", size: 25 },
  { x: 1078, pitch: 1, glyph: "♪", size: 26 },
  { x: 1146, pitch: -2, glyph: "♫", size: 25 },
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
        {/* the ribbon: five lines undulating out of phase with one another */}
        {LINE_OFFSETS.map((offset, i) => (
          <g key={offset} className="flourish-line" style={{ animationDelay: `${i * 0.45}s` }}>
            <path
              d={wavePath(offset)}
              stroke="var(--steel)"
              strokeOpacity={0.55}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}

        {/* clef, sitting on the ribbon */}
        <g className="flourish-line" style={{ animationDelay: "0.2s" }}>
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

        {/* notes, each bobbing on its own offset rhythm */}
        {NOTES.map((note, i) => (
          <g key={note.x} className="flourish-note" style={{ animationDelay: `${(i % 5) * 0.34}s` }}>
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
