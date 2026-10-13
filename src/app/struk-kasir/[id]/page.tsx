import { PrintButton } from "@/components/pos/PrintButton";
import { portalFetch } from "@/lib/portal";
import { formatRupiah } from "@/lib/format";
import { METHOD_LABEL, type PosOrderDetail } from "@/lib/posTypes";

export const dynamic = "force-dynamic";
export const metadata = { title: "Struk", robots: { index: false, follow: false } };

const when = (v: string) => new Date(v).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

export default async function StrukPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = await portalFetch<PosOrderDetail>(`/api/pos/orders/${id}`);
  return (
    <div className="min-h-screen bg-[#e9e9ef] p-4 print:bg-white print:p-0">
    <div className="mx-auto w-full max-w-[340px] rounded-2xl bg-white p-5 font-mono text-[12.5px] leading-relaxed text-black shadow-sm print:max-w-none print:rounded-none print:p-0 print:shadow-none">
      <div className="text-center">
        {o.receipt.header && <div className="whitespace-pre-line font-bold">{o.receipt.header}</div>}
        <div>{o.orderNumber}</div>
        <div>{when(o.createdAt)}</div>
        {o.customerName && <div>Pelanggan: {o.customerName}</div>}
      </div>
      <hr className="my-2 border-dashed border-black/40" />
      {o.items.map((it, i) => (
        <div key={i} className="mb-1">
          <div>{it.name}</div>
          <div className="flex justify-between"><span>{it.qty} × {formatRupiah(it.unitPrice)}</span><span>{formatRupiah(it.qty * it.unitPrice)}</span></div>
        </div>
      ))}
      <hr className="my-2 border-dashed border-black/40" />
      <div className="flex justify-between"><span>Subtotal</span><span>{formatRupiah(o.subtotal)}</span></div>
      {o.discount > 0 && <div className="flex justify-between"><span>Diskon</span><span>-{formatRupiah(o.discount)}</span></div>}
      <div className="flex justify-between text-[14px] font-bold"><span>TOTAL</span><span>{formatRupiah(o.total)}</span></div>
      <div className="flex justify-between"><span>Bayar ({METHOD_LABEL[o.paymentMethod]})</span><span>{formatRupiah(o.cashReceived ?? o.total)}</span></div>
      {o.changeGiven !== null && o.changeGiven > 0 && <div className="flex justify-between"><span>Kembalian</span><span>{formatRupiah(o.changeGiven)}</span></div>}
      {o.refundedAmount > 0 && <div className="mt-1 flex justify-between"><span>Di-refund</span><span>-{formatRupiah(o.refundedAmount)}</span></div>}
      {o.kioskVoucherCode && (
        <>
          <hr className="my-2 border-dashed border-black/40" />
          <div className="text-center">Kode kiosk<div className="text-[17px] font-bold tracking-wider">{o.kioskVoucherCode}</div></div>
        </>
      )}
      <hr className="my-2 border-dashed border-black/40" />
      <div className="whitespace-pre-line text-center">{o.receipt.footer}</div>
      <PrintButton />
    </div>
    </div>
  );
}
