/** Mirrors the composer page's layout — name, lifespan line, two links — so
 *  the click responds immediately and content arrives without a jump. */
export default function LoadingComposer() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12" role="status" aria-label="Loading composer">
      <div>
        <div className="skeleton h-8 w-1/2" />
        <div className="skeleton mt-3 h-4 w-40" />
      </div>
      <div className="skeleton h-4 w-64" />
      <div className="skeleton h-4 w-32" />
    </div>
  );
}
