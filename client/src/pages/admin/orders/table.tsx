

export interface Order {
    _id: string;
    user: {
        _id: string;
        username: string;
        email: string;
    };
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

import { useUpdateOrderStatus } from "@/hooks/useAdminOrders";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

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

export default function OrdersTable({ orders }: OrdersTableProps) {
    const { updateStatus, isLoading } = useUpdateOrderStatus();

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
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getColorForUser = (name: string) => {
        const colors = ['#7ab89a', '#d4824a', '#9a7ab8', '#4a7c4a', '#b87a7a', '#7ab8d4'];
        const index = name.charCodeAt(0) % colors.length;
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
                            <th className="px-8 py-6 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-forest-moss/5">
                        {orders.map((order) => (
                            <tr key={order._id} className="group hover:bg-oatmeal/30 transition-colors">
                                <td className="px-8 py-5">
                                    <span className="text-sm font-black text-forest-moss/80">#{order._id.slice(-6).toUpperCase()}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="size-10 rounded-full border-2 border-white flex items-center justify-center font-black text-white text-[10px] shadow-sm"
                                            style={{ backgroundColor: getColorForUser(order.user.username) }}
                                        >
                                            {getInitials(order.user.username)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-forest-moss leading-none">{order.user.username}</p>
                                            <p className="text-[10px] font-bold text-forest-moss-light/50 mt-1 uppercase tracking-tighter">{order.user.email}</p>
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
                                <td className="px-8 py-5 text-right">
                                    <button className="size-10 rounded-full bg-white border border-forest-moss/5 flex items-center justify-center text-forest-moss-light hover:bg-forest-moss hover:text-white transition-all shadow-sm">
                                        <span className="material-symbols-outlined text-xl!">visibility</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
