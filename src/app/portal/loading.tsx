// Shown instantly while a dashboard page fetches its data, so clicking a menu item reacts at once instead of
// freezing on the old page until the API answers. The frame (sidebar, header) stays; only this area swaps.
export default function Loading() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-label="Memuat">
      <div>
        <div className="skeleton h-3 w-24" />
        <div className="skeleton mt-3 h-8 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-[118px] rounded-[26px]" />)}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="skeleton h-[300px] rounded-[26px]" />
        <div className="skeleton h-[300px] rounded-[26px]" />
      </div>
      <div className="skeleton h-[220px] rounded-[26px]" />
    </div>
  );
}
