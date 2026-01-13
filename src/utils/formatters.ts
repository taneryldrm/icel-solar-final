

export const formatOrderStatus = (status: string) => {
    switch (status) {
        case 'pending':
        case 'pending_payment':
            return { label: 'Sipariş Alındı', color: 'bg-orange-100 text-orange-800 border-orange-200' };
        case 'processing':
        case 'processed':
        case 'approved':
            return { label: 'Hazırlanıyor', color: 'bg-blue-100 text-blue-800 border-blue-200' };
        case 'shipped':
            return { label: 'Kargolandı', color: 'bg-purple-100 text-purple-800 border-purple-200' };
        case 'delivered':
            return { label: 'Teslim Edildi', color: 'bg-green-100 text-green-800 border-green-200' };
        case 'cancelled':
            return { label: 'İptal Edildi', color: 'bg-red-100 text-red-800 border-red-200' };
        case 'returned':
            return { label: 'İade Edildi', color: 'bg-gray-100 text-gray-800 border-gray-200' };
        default:
            return { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
};

export const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2
    }).format(amount);
};
