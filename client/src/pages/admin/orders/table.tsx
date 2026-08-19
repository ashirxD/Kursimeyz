

export interface Order {
    _id: string;
    /** Admin-set label. Empty or absent means the derived one is shown. */
    orderNumber?: string;
    user?: {
        _id: string;
        username?: string;
        email?: string;
    } | null;
    items: Array<{
        _id: string;
        product: {
            _id: string;
            name: string;
            image: string;
            category?: string;
        };
        quantity: number;
        price: number;
    }>;
    shippingAddress: {
        street: string;
        city: string;
        zipCode: string;
        phone: string;
    };
    paymentMethod: string;
    itemsPrice: number;
    shippingPrice: number;
    totalPrice: number;
    isPaid: boolean;
    paidAt?: string;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    paymentConfirmation?: string;
    createdAt: string;
    updatedAt: string;
}

const statusStyles = {
    Pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        dot: "bg-yellow-500"
    },
    Processing: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        dot: "bg-blue-500"
    },
    Shipped: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        dot: "bg-purple-500"
    },
    Delivered: {
        bg: "bg-green-100",
        text: "text-green-800",
        dot: "bg-green-500"
    },
    Cancelled: {
        bg: "bg-red-100",
        text: "text-red-800",
        dot: "bg-red-500"
    }
};

import { useUpdateOrderStatus, useUpdateOrderNumber } from "@/hooks/useAdminOrders";
import { AxiosError } from "axios";
import {
    ORDER_NUMBER_MAX_LENGTH,
    isValidOrderNumber,
    orderLabel,
} from "@/utils/orderNumber";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import PaymentConfirmationModal from "@/components/paymentConfirmationModal";

interface OrdersTableProps {
    orders: Order[];
}

const StatusDropdown = ({ currentStatus, orderId, onStatusChange, isLoading }: {
    currentStatus: string;
    orderId: string;
    onStatusChange: (orderId: string, status: string) => void;
    isLoading: boolean;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);
    
    const statuses = [
        { value: 'Pending', label: 'Pending' },
        { value: 'Processing', label: 'Processing' },
        { value: 'Shipped', label: 'Shipped' },
        { value: 'Delivered', label: 'Delivered' },
        { value: 'Cancelled', label: 'Cancelled' }
    ];

    const handleSelect = (status: string) => {
        console.log('Dropdown selected:', { orderId, status, currentStatus });
        onStatusChange(orderId, status);
        setIsOpen(false);
    };

    const handleButtonClick = () => {
        if (!isLoading && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX
            });
            setIsOpen(!isOpen);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            
            // Check if click is outside dropdown and button
            if (!target.closest('.status-dropdown') && 
                buttonRef.current && 
                !buttonRef.current.contains(target)) {
                console.log('Click outside detected, closing dropdown');
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                console.log('Escape key pressed, closing dropdown');
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const dropdownContent = isOpen ? createPortal(
        <div 
            className="status-dropdown fixed bg-white rounded-2xl shadow-xl border border-forest-moss/10 py-2 z-50 min-w-[140px] overflow-hidden"
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
        >
            {statuses.map((status) => (
                <button
                    key={status.value}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Portal button clicked:', status.value);
                        handleSelect(status.value);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className={`w-full text-left px-4 py-2 text-xs font-black uppercase tracking-wider transition-all hover:bg-forest-moss/5 ${
                        status.value === currentStatus 
                            ? 'bg-forest-moss/10 text-forest-moss' 
                            : 'text-forest-moss/70 hover:text-forest-moss'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${statusStyles[status.value as keyof typeof statusStyles].dot}`}></span>
                        {status.label}
                    </div>
                </button>
            ))}
        </div>,
        document.body
    ) : null;

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={handleButtonClick}
                disabled={isLoading}
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-forest-moss/20 transition-all ${statusStyles[currentStatus as keyof typeof statusStyles].bg} ${statusStyles[currentStatus as keyof typeof statusStyles].text} ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm hover:scale-105'}`}
            >
                {currentStatus}
                <span className="material-symbols-outlined text-[14px] transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    expand_more
                </span>
            </button>
            {dropdownContent}
        </div>
    );
};

/**
 * The order's label, editable in place.
 *
 * The database _id cannot change — payment confirmations, review prompts and the
 * detail-page links all point at it — so what is edited here is a separate
 * human-readable number displayed in its place. Clearing the field puts the order
 * back on the label derived from its id.
 */
const OrderNumberCell = ({ order }: { order: Order }) => {
    const { updateOrderNumber, isPending } = useUpdateOrderNumber();
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState('');
    const [error, setError] = useState<string | null>(null);

    const stored = order.orderNumber?.trim() ?? '';
    // What the row would show with no custom number, used as the placeholder so
    // the admin can see what clearing the field would fall back to.
    const derived = orderLabel({ _id: order._id });

    const startEditing = () => {
        setDraft(stored);
        setError(null);
        setIsEditing(true);
    };

    const cancel = () => {
        setIsEditing(false);
        setError(null);
    };

    const save = async () => {
        const next = draft.trim();

        if (next === stored) {
            cancel();
            return;
        }

        // Checked here as well as on the server, so a typo is caught without a
        // round trip and the message names the allowed characters.
        if (!isValidOrderNumber(next)) {
            setError(`Up to ${ORDER_NUMBER_MAX_LENGTH} letters, numbers, spaces or - _ / # .`);
            return;
        }

        try {
            await updateOrderNumber({ orderId: order._id, orderNumber: next });
            setIsEditing(false);
            setError(null);
        } catch (failure) {
            const detail =
                failure instanceof AxiosError
                    ? (failure.response?.data as { message?: string } | undefined)?.message
                    : undefined;
            setError(detail || 'Could not save that number.');
        }
    };

    if (!isEditing) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-sm font-black text-forest-moss/80">
                    {orderLabel(order)}
                </span>
                <button
                    type="button"
                    onClick={startEditing}
                    title="Edit order number"
                    className="size-6 rounded-full flex items-center justify-center text-forest-moss/30 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-oatmeal hover:text-forest-moss transition-all"
                >
                    <span className="material-symbols-outlined text-[14px]!">edit</span>
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            <div className="flex items-center gap-1">
                <input
                    autoFocus
                    type="text"
                    value={draft}
                    disabled={isPending}
                    maxLength={ORDER_NUMBER_MAX_LENGTH}
                    placeholder={derived}
                    onChange={(e) => {
                        setDraft(e.target.value);
                        setError(null);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            save();
                        }
                        if (e.key === 'Escape') {
                            e.preventDefault();
                            cancel();
                        }
                    }}
                    className="w-32 bg-white px-2.5 py-1.5 rounded-lg border border-clay/40 focus:outline-none focus:ring-2 focus:ring-clay/30 font-black text-sm text-forest-moss disabled:opacity-50"
                />
                <button
                    type="button"
                    onClick={save}
                    disabled={isPending}
                    title="Save"
                    className="size-7 rounded-full bg-forest-moss text-white flex items-center justify-center hover:bg-forest-moss-light transition-all disabled:opacity-50"
                >
                    <span className="material-symbols-outlined text-[14px]!">check</span>
                </button>
                <button
                    type="button"
                    onClick={cancel}
                    disabled={isPending}
                    title="Cancel"
                    className="size-7 rounded-full bg-white border border-forest-moss/10 text-forest-moss/50 flex items-center justify-center hover:text-forest-moss transition-all disabled:opacity-50"
                >
                    <span className="material-symbols-outlined text-[14px]!">close</span>
                </button>
            </div>

            {error ? (
                <p className="text-[9px] font-bold text-red-500 max-w-[220px] leading-snug">
                    {error}
                </p>
            ) : (
                <p className="text-[9px] font-bold text-forest-moss/35 leading-snug">
                    Enter to save · empty reverts to {derived}
                </p>
            )}
        </div>
    );
};

export default function OrdersTable({ orders }: OrdersTableProps) {
    const navigate = useNavigate();
    const { updateStatus, isLoading } = useUpdateOrderStatus();
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState('');
    const [selectedOrderLabel, setSelectedOrderLabel] = useState('');

    const handleStatusChange = (orderId: string, newStatus: string) => {
        console.log('Table handleStatusChange called:', { orderId, newStatus });
        updateStatus({ orderId, status: newStatus });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return 'Rs ' + new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getCustomerLabel = (order: Order) =>
        order.user?.username || order.user?.email || 'Guest';

    const getInitials = (name: string) => {
        const safe = name?.trim() || 'G';
        return safe
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getColorForUser = (name: string) => {
        const colors = ['#7ab89a', '#d4824a', '#9a7ab8', '#4a7c4a', '#b87a7a', '#7ab8d4'];
        const safe = name?.trim() || 'G';
        const index = safe.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <div className="bg-white rounded-5xl shadow-soft overflow-hidden border border-white/50">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-forest-moss/5">
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-forest-moss/40">Order ID</th>
                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-forest-moss/40">Customer</th>
                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-forest-moss/40">Product</th>
                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-forest-moss/40">Amount</th>
                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-forest-moss/40">Status</th>
                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-forest-moss/40">Date</th>
                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-forest-moss/40 text-center">Payment</th>
                            <th className="px-8 py-6 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-forest-moss/5">
                        {orders.map((order) => {
                            const customerLabel = getCustomerLabel(order);
                            return (
                            <tr key={order._id} className="group hover:bg-oatmeal/30 transition-colors">
                                <td className="px-8 py-5">
                                    <OrderNumberCell order={order} />
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="size-10 rounded-full border-2 border-white flex items-center justify-center font-black text-white text-[10px] shadow-sm"
                                            style={{ backgroundColor: getColorForUser(customerLabel) }}
                                        >
                                            {getInitials(customerLabel)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-forest-moss leading-none">{customerLabel}</p>
                                            <p className="text-[10px] font-bold text-forest-moss-light/50 mt-1 uppercase tracking-tighter">{order.user?.email || '—'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                
                                        <div>
                                            <p className="text-sm font-black text-forest-moss leading-none">
                                                {order.items[0]?.product?.name || 'Unknown Product'}
                                                {order.items.length > 1 && ` +${order.items.length - 1}`}
                                            </p>
                                            <p className="text-[10px] font-bold text-forest-moss-light/50 mt-1 uppercase tracking-widest">
                                                {order.items[0]?.product?.category || 'Product'}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-sm font-black text-forest-moss">{formatCurrency(order.totalPrice)}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <StatusDropdown
                                        currentStatus={order.status}
                                        orderId={order._id}
                                        onStatusChange={handleStatusChange}
                                        isLoading={isLoading}
                                    />
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-sm font-bold text-forest-moss-light/70">{formatDate(order.createdAt)}</span>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    {order.isPaid ? (
                                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-black text-[9px] uppercase tracking-widest inline-flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]!">check_circle</span>
                                            Paid
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setSelectedOrderId(order._id);
                                                setSelectedOrderLabel(orderLabel(order));
                                                setPaymentModalOpen(true);
                                            }}
                                            className="px-3 py-1.5 rounded-full bg-clay text-white font-black text-[9px] uppercase tracking-widest hover:bg-clay/90 transition-colors shadow-soft"
                                        >
                                            Confirm
                                        </button>
                                    )}
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <button
                                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                                        className="size-10 rounded-full bg-white border border-forest-moss/5 flex items-center justify-center text-forest-moss-light hover:bg-forest-moss hover:text-white transition-all shadow-sm"
                                        title="View order details"
                                    >
                                        <span className="material-symbols-outlined text-xl!">visibility</span>
                                    </button>
                                </td>
                            </tr>
                        );
                        })}
                    </tbody>
                </table>
            </div>

            <PaymentConfirmationModal
                isOpen={paymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                orderId={selectedOrderId}
                orderLabel={selectedOrderLabel}
            />
        </div>
    );
}
