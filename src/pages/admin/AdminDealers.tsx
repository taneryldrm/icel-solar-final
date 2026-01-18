import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface DealerRequest {
    id: string;
    profile_id: string;
    company_name: string;
    contact_name: string;
    phone: string;
    email: string;
    address: string;
    activity_field: string;
    tax_office: string;
    tax_number: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    profiles?: {
        email: string;
        full_name: string;
    }
}

const AdminDealers: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
    const [requests, setRequests] = useState<DealerRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchRequests();
    }, [activeTab]);

    const fetchRequests = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('b2b_requests')
            .select('*, profiles:profile_id(email, full_name)')
            .eq('status', activeTab)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching requests:', error);
        } else {
            setRequests(data || []);
        }
        setLoading(false);
    };

    const handleApprove = async (request: DealerRequest) => {
        if (!window.confirm(`${request.company_name} bayilik başvurusunu onaylamak istiyor musunuz? Bu işlem kullanıcıyı 'b2b' rolüne yükseltecektir.`)) return;

        setProcessingId(request.id);
        try {
            const { error } = await supabase.rpc('approve_dealer_application', {
                request_id: request.id,
                target_user_id: request.profile_id
            });

            if (error) throw error;

            // Success: Remove from list
            setRequests(prev => prev.filter(r => r.id !== request.id));
            alert('Bayi başarıyla onaylandı ve yetkisi verildi!');

        } catch (error: any) {
            console.error('Error approving request:', error);
            alert('Onaylama başarısız oldu! ' + error.message);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string) => {
        if (!window.confirm('Bu başvuruyu reddetmek istediğinize emin misiniz?')) return;

        setProcessingId(id);
        try {
            const { error } = await supabase
                .from('b2b_requests')
                .update({ status: 'rejected' })
                .eq('id', id);

            if (error) throw error;

            setRequests(prev => prev.filter(r => r.id !== id));
            alert('Başvuru reddedildi.');

        } catch (error: any) {
            console.error('Error rejecting request:', error);
            alert('Hata: ' + error.message);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeleteDealer = async (request: DealerRequest) => {
        if (!window.confirm(`${request.company_name} bayiliğini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;

        setProcessingId(request.id);
        try {
            // B2B request kaydını sil
            const { error: deleteError } = await supabase
                .from('b2b_requests')
                .delete()
                .eq('id', request.id);

            if (deleteError) throw deleteError;

            setRequests(prev => prev.filter(r => r.id !== request.id));
            alert('Bayi başarıyla silindi.');

        } catch (error: any) {
            console.error('Error deleting dealer:', error);
            alert('Silme işlemi başarısız oldu! ' + error.message);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Bayi Yönetimi</h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`pb-2 px-4 font-medium transition-colors relative ${activeTab === 'pending'
                        ? 'text-yellow-600 border-b-2 border-yellow-500'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Bekleyen Başvurular
                </button>
                <button
                    onClick={() => setActiveTab('approved')}
                    className={`pb-2 px-4 font-medium transition-colors relative ${activeTab === 'approved'
                        ? 'text-yellow-600 border-b-2 border-yellow-500'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Aktif Bayiler (B2B)
                </button>
            </div>

            {loading ? (
                <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
            ) : requests.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-sm text-center text-gray-500 border border-gray-200">
                    {activeTab === 'pending' ? 'Bekleyen başvuru bulunmamaktadır.' : 'Henüz aktif bayi bulunmamaktadır.'}
                </div>
            ) : (
                <div className="grid gap-6">
                    {requests.map((req) => (
                        <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-start justify-between">
                                    <h3 className="text-xl font-bold text-gray-900">{req.company_name}</h3>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${req.status === 'approved'
                                        ? 'bg-green-100 text-green-800'
                                        : req.status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                        {req.status === 'approved' ? 'Aktif Bayi' :
                                            req.status === 'pending' ? 'Beklemede' : 'Reddedildi'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600">
                                    <p><strong className="text-gray-900">Yetkili:</strong> {req.contact_name}</p>
                                    <p><strong className="text-gray-900">Tel:</strong> {req.phone}</p>
                                    <p><strong className="text-gray-900">E-posta:</strong> {req.email}</p>
                                    <p><strong className="text-gray-900">Vergi No:</strong> {req.tax_number}</p>
                                    <p><strong className="text-gray-900">Vergi Dairesi:</strong> {req.tax_office}</p>
                                    <p><strong className="text-gray-900">Sektör:</strong> {req.activity_field}</p>
                                    <p className="md:col-span-2"><strong className="text-gray-900">Adres:</strong> {req.address}</p>
                                    <p className="md:col-span-2 text-xs text-gray-400 mt-2">
                                        {req.status === 'approved' ? 'Onay Tarihi:' : 'Başvuru Tarihi:'} {new Date(req.created_at).toLocaleString('tr-TR')}
                                    </p>
                                    {req.profiles && (
                                        <p className="md:col-span-2 text-xs text-yellow-700 mt-1">Eşleşen Profil: {req.profiles.full_name} ({req.profiles.email})</p>
                                    )}
                                </div>
                            </div>

                            {activeTab === 'pending' && (
                                <div className="flex md:flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                                    <button
                                        onClick={() => handleApprove(req)}
                                        disabled={processingId === req.id}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 text-sm"
                                    >
                                        {processingId === req.id ? 'İşleniyor...' : 'ONAYLA'}
                                    </button>
                                    <button
                                        onClick={() => handleReject(req.id)}
                                        disabled={processingId === req.id}
                                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 text-sm"
                                    >
                                        Reddet
                                    </button>
                                </div>
                            )}

                            {activeTab === 'approved' && (
                                <div className="flex md:flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                                    <button
                                        onClick={() => handleDeleteDealer(req)}
                                        disabled={processingId === req.id}
                                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 text-sm"
                                    >
                                        {processingId === req.id ? 'Siliniyor...' : 'SİL'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDealers;
