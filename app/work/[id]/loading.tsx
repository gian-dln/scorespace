/**
 * Shown the instant a work is clicked. Fetching a work costs ~0.8s cached and
 * ~2s cold, and without this the click produced no feedback at all.
 *
 * The shapes mirror WorkDetail's real layout — title, composer line, metadata
 * grid, score list — so content lands in place instead of shifting.
 */
export default function LoadingWork() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12" role="status" aria-label="Loading work">
      <div className="skeleton h-8 w-2/3" />
      <div className="skeleton mt-3 h-4 w-1/3" />

      <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <div className="skeleton h-3 w-16" />
            <div className="skeleton mt-2 h-4 w-24" />
          </div>
        ))}
      </div>

      <div className="skeleton mt-10 h-5 w-20" />
      <div className="mt-4 flex flex-col gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-4" style={{ width: `${52 - i * 6}%` }} />
        ))}
      </div>
    </div>
  );
}
