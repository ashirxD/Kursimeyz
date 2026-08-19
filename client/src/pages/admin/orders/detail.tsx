import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '@/pages/admin/layout/Header';
import PaymentConfirmationModal from '@/components/paymentConfirmationModal';
import { orderLabel } from "@/utils/orderNumber";
import { useAdminOrderDetail } from '@/hooks/useAdminOrders';
import { resolveImageUrl } from '@/utils/imageUrl';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const statusStyles: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Processing: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-purple-100 text-purple-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCurrency = (amount: number) =>
  'Rs ' +
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export default function AdminOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { order, isLoading, isError, refetch } = useAdminOrderDetail(orderId);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-moss"></div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="text-red-500 font-bold">Order not found</div>
        <Link
          to="/admin/orders"
          className="px-4 py-2 bg-forest-moss text-white rounded-xl font-black hover:bg-forest-moss-light transition-colors"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const confirmation = order.paymentConfirmation;
  const legacyReceipt = order.paymentResult?.receipt;
  const shortOrderId = orderLabel(order);

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(43, 62, 53);
    doc.text(`Kursimeyz Order ${shortOrderId}`, 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

    autoTable(doc, {
      startY: 36,
      theme: 'grid',
      headStyles: { fillColor: [43, 62, 53] },
      styles: { fontSize: 9, cellPadding: 3 },
      head: [['Order Summary', 'Details']],
      body: [
        ['Order ID', order._id],
        ['Status', order.status],
        ['Placed At', formatDate(order.createdAt)],
        ['Updated At', formatDate(order.updatedAt)],
      ],
    });

    autoTable(doc, {
      startY: ((doc as any).lastAutoTable?.finalY || 36) + 8,
      theme: 'grid',
      headStyles: { fillColor: [43, 62, 53] },
      styles: { fontSize: 9, cellPadding: 3 },
      head: [['Customer', 'Shipping Address']],
      body: [[
        [
          order.user?.username || 'N/A',
          order.user?.email || 'N/A',
          order.user?.phone || 'N/A',
        ].join('\n'),
        [
          order.shippingAddress.street,
          `${order.shippingAddress.city}, ${order.shippingAddress.zipCode}`,
          order.shippingAddress.phone,
        ].join('\n'),
      ]],
    });

    autoTable(doc, {
      startY: ((doc as any).lastAutoTable?.finalY || 36) + 8,
      theme: 'grid',
      headStyles: { fillColor: [43, 62, 53] },
      styles: { fontSize: 8, cellPadding: 3 },
      head: [['Product', 'Category', 'Qty', 'Unit Price', 'Line Total']],
      body: order.items.map((item) => [
        item.product?.name || 'Unknown Product',
        item.product?.category || 'Product',
        item.quantity.toString(),
        formatCurrency(item.price),
        formatCurrency(item.price * item.quantity),
      ]),
    });

    autoTable(doc, {
      startY: ((doc as any).lastAutoTable?.finalY || 36) + 8,
      theme: 'grid',
      headStyles: { fillColor: [43, 62, 53] },
      styles: { fontSize: 9, cellPadding: 3 },
      head: [['Payment & Totals', 'Details']],
      body: [
        ['Payment Method', order.paymentMethod],
        ['Payment Status', order.isPaid ? 'Paid' : 'Unpaid'],
        ['Paid At', formatDate(order.paidAt)],
        ['Items Total', formatCurrency(order.itemsPrice)],
        ['Shipping', formatCurrency(order.shippingPrice)],
        ['Grand Total', formatCurrency(order.totalPrice)],
      ],
    });

    autoTable(doc, {
      startY: ((doc as any).lastAutoTable?.finalY || 36) + 8,
      theme: 'grid',
      headStyles: { fillColor: [43, 62, 53] },
      styles: { fontSize: 9, cellPadding: 3 },
      head: [['Payment Confirmation', 'Details']],
      body: confirmation
        ? [
            ['Transaction Ref', confirmation.transactionReference || 'N/A'],
            ['Payment Date', formatDate(confirmation.paymentDate)],
            ['Confirmed By', confirmation.confirmedBy?.username || 'N/A'],
            ['Confirmed At', formatDate(confirmation.confirmedAt)],
            ['Receipt URL', confirmation.receiptUrl ? resolveImageUrl(confirmation.receiptUrl) : 'N/A'],
          ]
        : legacyReceipt
          ? [
              ['Record Type', 'Legacy confirmation'],
              ['Reference', order.paymentResult?.id || 'N/A'],
              ['Receipt URL', legacyReceipt.startsWith('data:') ? 'Embedded legacy receipt' : resolveImageUrl(legacyReceipt)],
            ]
          : [['Confirmation', order.isPaid ? 'No manual confirmation details on file.' : 'Payment has not been confirmed yet.']],
    });

    // A label may legitimately contain '#' or '/', neither of which belongs in a
    // download filename.
    const fileSafeId = shortOrderId.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
    doc.save(`Kursimeyz-Order-${fileSafeId}.pdf`);
  };

  return (
    <div className="flex-1 flex flex-col gap-4 px-0 md:px-2 pb-6">
      <Header />

      <div className="flex flex-col gap-6 px-4 md:px-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1.5 text-clay font-extrabold text-[11px] uppercase tracking-widest hover:underline"
            >
              <span className="material-symbols-outlined text-base!">arrow_back</span>
              Orders Registry
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-black text-forest-moss tracking-tight">
                Order {orderLabel(order)}
              </h2>
              <span
                className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest ${statusStyles[order.status] || 'bg-gray-100 text-gray-800'}`}
              >
                {order.status}
              </span>
            </div>
            <p className="text-forest-moss-light/70 font-bold text-xs">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start">
            <button
              onClick={handleExportPDF}
              className="px-6 py-3 bg-forest-moss text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-forest-moss-light transition-colors shadow-soft flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg!">picture_as_pdf</span>
              Export PDF
            </button>

            {!order.isPaid && (
              <button
                onClick={() => setPaymentModalOpen(true)}
                className="px-6 py-3 bg-clay text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-clay/90 transition-colors shadow-soft flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg!">verified</span>
                Confirm Payment
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl shadow-soft p-6 border border-white/50 space-y-4">
            <h3 className="text-sm font-black text-forest-moss uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-clay">person</span>
              Customer
            </h3>
            <div className="space-y-2">
              <p className="text-lg font-black text-forest-moss">{order.user?.username || '—'}</p>
              <p className="text-sm font-bold text-forest-moss-light/70">{order.user?.email || '—'}</p>
              {order.user?.phone && (
                <p className="text-sm font-bold text-forest-moss-light/70">{order.user.phone}</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-soft p-6 border border-white/50 space-y-4">
            <h3 className="text-sm font-black text-forest-moss uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-clay">local_shipping</span>
              Shipping Address
            </h3>
            <div className="space-y-1 text-sm font-bold text-forest-moss-light/80">
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.zipCode}
              </p>
              <p className="text-forest-moss font-black">{order.shippingAddress.phone}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-soft overflow-hidden border border-white/50">
          <div className="px-6 py-5 border-b border-forest-moss/5">
            <h3 className="text-sm font-black text-forest-moss uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-clay">shopping_bag</span>
              Order Items
            </h3>
          </div>
          <div className="divide-y divide-forest-moss/5">
            {order.items.map((item) => (
              <div key={item._id} className="flex items-center gap-4 px-6 py-4">
                <div className="size-14 rounded-xl bg-oatmeal overflow-hidden shrink-0">
                  {item.product?.image ? (
                    <img
                      src={resolveImageUrl(item.product.image)}
                      alt={item.product.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center text-forest-moss/30">
                      <span className="material-symbols-outlined">chair</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-forest-moss truncate">
                    {item.product?.name || 'Unknown Product'}
                  </p>
                  <p className="text-[10px] font-bold text-forest-moss-light/50 uppercase tracking-widest">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-black text-forest-moss">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="px-6 py-5 bg-oatmeal/30 space-y-2">
            <div className="flex justify-between text-sm font-bold text-forest-moss-light/70">
              <span>Items</span>
              <span>{formatCurrency(order.itemsPrice)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-forest-moss-light/70">
              <span>Shipping</span>
              <span>{formatCurrency(order.shippingPrice)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-forest-moss pt-2 border-t border-forest-moss/10">
              <span>Total</span>
              <span>{formatCurrency(order.totalPrice)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl shadow-soft p-6 border border-white/50 space-y-4">
            <h3 className="text-sm font-black text-forest-moss uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-clay">credit_card</span>
              Payment Summary
            </h3>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-xs font-bold text-forest-moss-light/60 uppercase tracking-widest">Method</dt>
                <dd className="text-sm font-black text-forest-moss">{order.paymentMethod}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-xs font-bold text-forest-moss-light/60 uppercase tracking-widest">Status</dt>
                <dd>
                  {order.isPaid ? (
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-black text-[9px] uppercase tracking-widest">
                      Paid
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-black text-[9px] uppercase tracking-widest">
                      Unpaid
                    </span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-xs font-bold text-forest-moss-light/60 uppercase tracking-widest">Paid At</dt>
                <dd className="text-sm font-bold text-forest-moss">{formatDate(order.paidAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-3xl shadow-soft p-6 border border-white/50 space-y-4">
            <h3 className="text-sm font-black text-forest-moss uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-clay">receipt_long</span>
              Payment Confirmation
            </h3>

            {confirmation ? (
              <dl className="space-y-3">
                <div className="flex justify-between gap-4">
                  <dt className="text-xs font-bold text-forest-moss-light/60 uppercase tracking-widest shrink-0">
                    Transaction Ref
                  </dt>
                  <dd className="text-sm font-black text-forest-moss text-right">
                    {confirmation.transactionReference || '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-xs font-bold text-forest-moss-light/60 uppercase tracking-widest shrink-0">
                    Payment Date
                  </dt>
                  <dd className="text-sm font-bold text-forest-moss text-right">
                    {formatDate(confirmation.paymentDate)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-xs font-bold text-forest-moss-light/60 uppercase tracking-widest shrink-0">
                    Confirmed By
                  </dt>
                  <dd className="text-sm font-bold text-forest-moss text-right">
                    {confirmation.confirmedBy?.username || '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-xs font-bold text-forest-moss-light/60 uppercase tracking-widest shrink-0">
                    Confirmed At
                  </dt>
                  <dd className="text-sm font-bold text-forest-moss text-right">
                    {formatDate(confirmation.confirmedAt)}
                  </dd>
                </div>
                {confirmation.receiptUrl && (
                  <div className="pt-2">
                    <p className="text-xs font-bold text-forest-moss-light/60 uppercase tracking-widest mb-2">
                      Receipt
                    </p>
                    <a
                      href={resolveImageUrl(confirmation.receiptUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl overflow-hidden border border-forest-moss/10 hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={resolveImageUrl(confirmation.receiptUrl)}
                        alt="Payment receipt"
                        className="w-full max-h-48 object-contain bg-oatmeal/30"
                      />
                    </a>
                  </div>
                )}
              </dl>
            ) : legacyReceipt ? (
              <div className="space-y-3">
                <p className="text-xs font-bold text-forest-moss-light/50">
                  Legacy confirmation record (before PaymentConfirmation schema)
                </p>
                {order.paymentResult?.id && (
                  <p className="text-sm font-black text-forest-moss">Ref: {order.paymentResult.id}</p>
                )}
                <img
                  src={legacyReceipt.startsWith('data:') ? legacyReceipt : resolveImageUrl(legacyReceipt)}
                  alt="Legacy receipt"
                  className="w-full max-h-48 object-contain rounded-xl border border-forest-moss/10 bg-oatmeal/30"
                />
              </div>
            ) : (
              <p className="text-sm font-bold text-forest-moss-light/50">
                {order.isPaid
                  ? 'No manual confirmation details on file.'
                  : 'Payment has not been confirmed yet.'}
              </p>
            )}
          </div>
        </div>
      </div>

      <PaymentConfirmationModal
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          refetch();
        }}
        orderId={order._id}
        orderLabel={shortOrderId}
      />
    </div>
  );
}
