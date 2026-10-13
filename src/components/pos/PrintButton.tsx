"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn btn-primary mt-4 w-full px-5 py-3 font-sans text-[14px] print:hidden">
      Cetak struk
    </button>
  );
}
