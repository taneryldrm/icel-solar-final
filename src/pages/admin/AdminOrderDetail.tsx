import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useParams, Link } from 'react-router-dom';
import { formatOrderStatus, formatDate, formatCurrency } from '../../utils/formatters';

interface OrderDetail {
    id: string;
    order_no: string;
    user_id: string; // Updated from profile_id if it existed, or added new
    grand_total: number;
    status: string;
    created_at: string;
    profiles: {
        email: string;
        role: string;
        phone: string | null;
        full_name?: string;
    } | null;
    order_items: {
        id: string;
        product_name_snapshot: string;
        sku_snapshot: string;
        unit_price_snapshot: number;
        quantity: number;
        line_total: number;
    }[];
}



const AdminOrderDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [updating, setUpdating] = useState<boolean>(false);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select(`
                        id, order_no, user_id, grand_total, status, created_at,
                        profiles:user_id ( email, role, phone, full_name ),
                        order_items ( id, product_name_snapshot, sku_snapshot, unit_price_snapshot, quantity, line_total )
                    `)
                    .eq('id', id)
                    .single();

                if (error) throw error;

                // Format data to handle profiles array wrap if present
                const formatted: OrderDetail = {
                    ...data,
                    profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
                };

                setOrder(formatted);
            } catch (error) {
                console.error("Error fetching order detail:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    const handleStatusChange = async (newStatus: string) => {
        if (!order) return;

        // Tracking Number Logic
        let trackingNumber = '';
        if (newStatus === 'shipped') {
            const input = prompt("Lütfen kargo takip numarasını giriniz:");
            if (input === null) return; // Cancelled
            trackingNumber = input;
        }

        setUpdating(true);
        try {
            // 1. Update Status in DB
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus }) // If we had a tracking_number column, we would update it here too
                .eq('id', order.id);

            if (error) throw error;

            setOrder({ ...order, status: newStatus });
            alert("Sipariş durumu güncellendi.");

            // 2. Trigger Email Notification (Non-blocking)
            supabase.functions.invoke('send-order-email', {
                body: {
                    orderId: order.id,
                    orderNo: order.order_no,
                    status: newStatus,
                    customerEmail: order.profiles?.email,
                    customerName: order.profiles?.full_name || 'Sayın Müşteri', // Assuming full_name exists or fallback
                    trackingNumber: trackingNumber,
                    grandTotal: order.grand_total
                }
            }).then(({ data, error }) => {
                if (error) console.error("Email send error:", error);
                else console.log("Email sent:", data);
            });

        } catch (error) {
            console.error("Status update error:", error);
            alert("Durum güncellenemedi.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;
    if (!order) return <div className="p-8 text-center text-red-500">Sipariş bulunamadı.</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <Link to="/admin/orders" className="text-gray-500 hover:text-gray-900 text-sm mb-2 inline-flex items-center transition-colors">
                            <span className="mr-1">&larr;</span> Sipariş Listesine Dön
                        </Link>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sipariş #{order.order_no}</h1>
                                <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                    <span>{formatDate(order.created_at)}</span>
                                    <span className="text-gray-300">•</span>
                                    <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">ID: {order.id.split('-')[0]}</span>
                                </div>
                            </div>

                            {/* Status Changer */}
                            <div className="flex flex-col items-end gap-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sipariş Durumu</label>
                                <div className="relative">
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                        disabled={updating}
                                        className={`appearance-none pl-4 pr-10 py-2.5 rounded-lg border text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all cursor-pointer ${formatOrderStatus(order.status).color} bg-white`}
                                    >
                                        <option value="pending_payment">Ödeme Bekliyor</option>
                                        <option value="approved">Hazırlanıyor</option>
                                        <option value="shipped">Kargolandı</option>
                                        <option value="delivered">Teslim Edildi</option>
                                        <option value="cancelled">İptal Edildi</option>
                                        <option value="returned">İade Edildi</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content: Order Items */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                    <h3 className="font-semibold text-gray-900">Sipariş İçeriği</h3>
                                </div>
                                <table className="w-full text-left">
                                    <thead className="bg-white border-b border-gray-100 text-xs text-gray-500 uppercase">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Ürün</th>
                                            <th className="px-6 py-3 font-medium text-center">Adet</th>
                                            <th className="px-6 py-3 font-medium text-right">Birim Fiyat</th>
                                            <th className="px-6 py-3 font-medium text-right">Toplam</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        {order.order_items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{item.product_name_snapshot}</div>
                                                    <div className="text-gray-500 text-xs font-mono">{item.sku_snapshot}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">{item.quantity}</td>
                                                <td className="px-6 py-4 text-right">{formatCurrency(item.unit_price_snapshot)}</td>
                                                <td className="px-6 py-4 text-right font-medium">
                                                    {formatCurrency(item.line_total)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 font-semibold text-gray-900">
                                        <tr>
                                            <td colSpan={3} className="px-6 py-4 text-right">Genel Toplam</td>
                                            <td className="px-6 py-4 text-right text-lg">
                                                {formatCurrency(order.grand_total)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Sidebar: Customer Info */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Müşteri Bilgileri</h3>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="block text-gray-500 text-xs">Email</span>
                                        <div className="font-medium">{order.profiles?.email}</div>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 text-xs mb-1">Rol</span>
                                        <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wide">
                                            {order.profiles?.role || 'Müşteri'}
                                        </div>
                                    </div>
                                    {order.profiles?.phone && (
                                        <div>
                                            <span className="block text-gray-500 text-xs">Telefon</span>
                                            <div className="font-medium">{order.profiles.phone}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Optional: Shipping Address Placeholder if exists in schema later */}
                            {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Teslimat Adresi</h3>
                            <div className="text-sm text-gray-600">
                                Adres verisi 'addresses' tablosundan çekilebilir veya snapshot alınabilir.
                            </div>
                        </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetail;
