// Shapes returned by the kiosk API's /api/pos/* routes (server/routes/pos.ts).

export type PosLineType = "package" | "print" | "product" | "custom" | "frame";
export type PosItem = { type: PosLineType; refId?: string | null; name: string; qty: number; unitPrice: number };
export type PaymentMethod = "cash" | "qris" | "transfer" | "other";

export type PosCatalog = {
  packages: { id: string; name: string; price: number; photoCount: number; thumbnailUrl: string | null; prints: { key: string; name: string; price: number }[] }[];
  products: { id: string; name: string; price: number }[];
  customFrames: { id: string; name: string; customerName: string | null; price: number; imageUrl: string | null; orientation: string }[];
  booths: { id: string; label: string }[];
  shift: { id: string; cashierName: string; openedAt: string } | null;
  settings: { receiptHeader: string; receiptFooter: string; queuePrefix: string; hasPin: boolean };
};

export type PosOrder = {
  id: string; orderNumber: string; items: PosItem[]; subtotal: number; discount: number; total: number;
  paymentMethod: PaymentMethod; cashReceived: number | null; changeGiven: number | null;
  status: "paid" | "partial_refund" | "refunded"; refundedAmount: number;
  customerName: string | null; customerWhatsapp: string | null; kioskVoucherCode: string | null; queueTicketId: string | null;
  shiftId: string | null; createdAt: string;
};
export type PosOrderDetail = PosOrder & { refunds: { id: string; amount: number; reason: string; createdAt: string }[]; receipt: { header: string; footer: string } };

export type PosShift = {
  id: string; cashierName: string; openedAt: string; closedAt: string | null; note: string | null;
  openingCash: number; orderCount: number; salesByMethod: Record<string, number>; salesTotal: number;
  refundTotal: number; cashRefunds: number; expectedCash: number; countedCash: number | null; difference: number | null;
};

export type PosTicket = {
  id: string; label: string; seq: number; customerName: string | null; customerWhatsapp: string | null; partySize: number;
  status: "waiting" | "called" | "serving" | "done" | "skipped"; kioskKeyId: string | null; orderId: string | null;
  createdAt: string; calledAt: string | null; doneAt: string | null;
};

export type PosProduct = { id: string; name: string; price: number; active: boolean };
export type PosSettings = { receiptHeader: string; receiptFooter: string; queuePrefix: string; hasPin: boolean };

export type PosReport = {
  days: number; orders: number; sales: number; refunds: number; net: number; average: number;
  byMethod: Record<string, number>;
  daily: { date: string; orders: number; sales: number; refunds: number }[];
  topItems: { name: string; qty: number; revenue: number }[];
};

export const METHOD_LABEL: Record<string, string> = { cash: "Tunai", qris: "QRIS", transfer: "Transfer", other: "Lainnya" };
