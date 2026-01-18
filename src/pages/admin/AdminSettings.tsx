import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Save, RefreshCw } from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency';

const AdminSettings: React.FC = () => {
    const { rate, refreshRate } = useCurrency();
    const [inputRate, setInputRate] = useState<string>('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (rate) {
            setInputRate(rate.toString());
        }
    }, [rate]);

    const handleSave = async () => {
        const newRate = parseFloat(inputRate);
        if (isNaN(newRate) || newRate <= 0) {
            alert('Lütfen geçerli bir kur giriniz.');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('settings')
                .upsert({ key: 'usd_rate', value: newRate });

            if (error) throw error;

            alert('Dolar kuru başarıyla güncellendi!');
            refreshRate(); // Update global state
        } catch (error: any) {
            console.error('Error saving rate:', error);
            alert('Hata: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Genel Ayarlar</h1>

            <div className="max-w-xl bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                    <div className="p-3 bg-green-100 text-green-700 rounded-lg">
                        <span className="text-2xl font-bold">$</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Dolar Kuru Ayarı</h2>
                        <p className="text-sm text-gray-500">Sitedeki tüm ürün fiyatları bu kur ile çarpılarak hesaplanır.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Güncel Dolar Kuru (TL)</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f0c961] focus:border-transparent text-lg font-bold text-gray-800"
                                value={inputRate}
                                onChange={(e) => setInputRate(e.target.value)}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">TL</div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 bg-[#1a1a1a] text-[#f0c961] font-bold py-3 px-6 rounded-lg hover:bg-[#333] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {saving ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            {saving ? 'Kaydediliyor...' : 'KURU GÜNCELLE'}
                        </button>
                    </div>

                    <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm text-yellow-800">
                        <strong>Bilgi:</strong> Kuru değiştirdiğinizde, sitedeki tüm ürünlerin TL fiyatları anında güncellenir.
                        Örnek: Ürün fiyatı <strong>100$</strong> ise ve kuru <strong>35.00</strong> yaparsanız, ürün sitede <strong>3.500 TL</strong> olarak görünür.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
