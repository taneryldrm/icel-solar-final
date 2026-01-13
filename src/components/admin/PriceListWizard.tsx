import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { X, Search, ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface PriceListWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

interface ProductVariant {
    id: string;
    name: string;
    sku: string;
    base_price: number;
    product_id: string;
    product_name: string;
    image_url: string | null;
}

interface SelectedItem {
    variantId: string;
    customPrice: number | null;
}

const PriceListWizard: React.FC<PriceListWizardProps> = ({ isOpen, onClose, onSave }) => {
    // --- Global Wizard State ---
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Step 1: General Info
    const [name, setName] = useState('');
    const [currency, setCurrency] = useState('TRY');
    const [type, setType] = useState('b2b');

    // Step 2: Selection
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [filteredVariants, setFilteredVariants] = useState<ProductVariant[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState<Record<string, SelectedItem>>({}); // Map for O(1) access

    // --- Data Fetching ---
    useEffect(() => {
        if (isOpen && step === 2 && variants.length === 0) {
            fetchProducts();
        }
    }, [isOpen, step]);

    useEffect(() => {
        if (!isOpen) {
            // Reset state on close
            setStep(1);
            setName('');
            setCurrency('TRY');
            setType('b2b');
            setSelectedItems({});
            setSearchTerm('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredVariants(variants);
        } else {
            const lowerTerm = searchTerm.toLowerCase();
            setFilteredVariants(variants.filter(v =>
                v.product_name.toLowerCase().includes(lowerTerm) ||
                v.name.toLowerCase().includes(lowerTerm) ||
                v.sku.toLowerCase().includes(lowerTerm)
            ));
        }
    }, [searchTerm, variants]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Fetch products with variants and primary image
            const { data, error } = await supabase
                .from('products')
                .select(`
                    id, name,
                    product_variants (id, name, sku, base_price, is_active),
                    product_images (url, is_primary)
                `)
                .eq('is_active', true);

            if (error) throw error;

            const flattened: ProductVariant[] = [];

            data?.forEach((product: any) => {
                const primaryImg = product.product_images?.find((img: any) => img.is_primary) || product.product_images?.[0];
                const imgUrl = primaryImg ? primaryImg.url : null;

                product.product_variants?.forEach((variant: any) => {
                    if (variant.is_active) {
                        flattened.push({
                            id: variant.id,
                            name: variant.name,
                            sku: variant.sku,
                            base_price: variant.base_price,
                            product_id: product.id,
                            product_name: product.name,
                            image_url: imgUrl
                        });
                    }
                });
            });

            setVariants(flattened);
            setFilteredVariants(flattened);

        } catch (error) {
            console.error("Error fetching wizard data:", error);
            alert("Ürün verileri alınamadı.");
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers ---

    const handleNext = () => {
        if (step === 1) {
            if (!name) return alert("Lütfen liste adı giriniz.");
        }
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const toggleSelection = (variantId: string) => {
        setSelectedItems(prev => {
            const next = { ...prev };
            if (next[variantId]) {
                delete next[variantId];
            } else {
                next[variantId] = { variantId, customPrice: null };
            }
            return next;
        });
    };

    const updatePrice = (variantId: string, price: string) => {
        // If not selected, select it first
        const numPrice = price === '' ? null : parseFloat(price);

        setSelectedItems(prev => ({
            ...prev,
            [variantId]: {
                variantId,
                customPrice: numPrice
            }
        }));
    };

    const handleSaveList = async () => {
        setSaving(true);
        try {
            // 1. Create Price List
            const { data: listData, error: listError } = await supabase
                .from('price_lists')
                .insert({
                    name,
                    currency,
                    type,
                    created_at: new Date().toISOString()
                })
                .select('id')
                .single();

            if (listError) throw listError;

            const listId = listData.id;

            // 2. Insert Items
            const itemsToInsert = Object.values(selectedItems).map(item => ({
                price_list_id: listId,
                variant_id: item.variantId,
                price: item.customPrice, // Can be null (if logic allows) or we can filter logic later
                is_active: true
            })).filter(i => i.price !== null && i.price !== undefined); // Only insert with valid prices? Or allow null as base price?
            // Usually price list items MUST have a price. If user didn't enter custom price, maybe we shouldn't add it or add base price?
            // Requirement says "Custom price input". Let's assume if left blank, it's not added or added with 0? 
            // Let's assume must have price. Filter out nulls for now or warn user.
            // Actually, let's include all selected items. If price is null, maybe backend defaults or it's an error.
            // For safety, let's only insert items with valid prices.

            // Re-evaluating: If I selected it but didn't enter price, maybe I want base price?
            // Let's filter items that have a price.

            if (itemsToInsert.length > 0) {
                const { error: itemsError } = await supabase
                    .from('variant_prices')
                    .insert(itemsToInsert);

                if (itemsError) throw itemsError;
            }

            alert("Fiyat listesi başarıyla oluşturuldu.");
            onSave();
            onClose();

        } catch (error: any) {
            console.error("Save error:", error);
            alert("Liste kaydedilirken hata oluştu: " + error.message);
        } finally {
            setSaving(false);
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[600px] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Yeni Fiyat Listesi Oluştur</h3>
                        <p className="text-xs text-gray-500">Adım {step} / 3</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden p-6">

                    {/* STEP 1: General Info */}
                    {step === 1 && (
                        <div className="max-w-md mx-auto space-y-6 pt-10">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Liste Adı</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#f0c961] focus:border-transparent outline-none transition-all"
                                    placeholder="Örn: 2024 Bayi Listesi"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Para Birimi</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#f0c961] outline-none"
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                    >
                                        <option value="TRY">Türk Lirası (₺)</option>
                                        <option value="USD">Amerikan Doları ($)</option>
                                        <option value="EUR">Euro (€)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Liste Türü</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#f0c961] outline-none"
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                    >
                                        <option value="b2b">Bayi (B2B)</option>
                                        <option value="retail">Perakende</option>
                                        <option value="special">Özel Kampanya</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Selection */}
                    {step === 2 && (
                        <div className="flex flex-col h-full">
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Ürün adı, SKU veya varyant ara..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f0c961] focus:border-transparent outline-none"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                                {loading ? (
                                    <div className="flex justify-center items-center h-40">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f0c961]"></div>
                                    </div>
                                ) : (
                                    <table className="w-full text-left bg-white text-sm">
                                        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th className="p-3 w-10"></th>
                                                <th className="p-3">Ürün / Varyant</th>
                                                <th className="p-3 text-right">Base Fiyat</th>
                                                <th className="p-3 w-40 text-right bg-yellow-50 text-yellow-800 font-bold border-l border-yellow-100">Özel Fiyat</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredVariants.map(v => {
                                                const isSelected = !!selectedItems[v.id];
                                                const customPrice = selectedItems[v.id]?.customPrice;

                                                return (
                                                    <tr key={v.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-yellow-50/30' : ''}`}>
                                                        <td className="p-3 text-center">
                                                            <input
                                                                type="checkbox"
                                                                className="w-4 h-4 text-[#f0c961] rounded border-gray-300 focus:ring-[#f0c961]"
                                                                checked={isSelected}
                                                                onChange={() => toggleSelection(v.id)}
                                                            />
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
                                                                    {v.image_url ? (
                                                                        <img src={v.image_url} alt="" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                            <Check className="w-4 h-4" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-gray-900">{v.product_name}</div>
                                                                    <div className="text-xs text-gray-500">{v.name} • <span className="font-mono">{v.sku}</span></div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-right text-gray-500 font-mono">
                                                            {v.base_price.toFixed(2)}
                                                        </td>
                                                        <td className={`p-3 border-l ${isSelected ? 'border-yellow-200 bg-yellow-50' : 'border-dashed border-gray-200'}`}>
                                                            <input
                                                                type="number"
                                                                placeholder={v.base_price.toString()}
                                                                className={`w-full text-right px-2 py-1.5 rounded border transition-all outline-none focus:ring-2 focus:ring-[#f0c961] ${customPrice ? 'border-yellow-400 font-bold text-gray-900' : 'border-gray-200 text-gray-500'
                                                                    }`}
                                                                value={customPrice || ''}
                                                                onChange={(e) => updatePrice(v.id, e.target.value)}
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                            <div className="mt-2 text-right text-sm text-gray-500">
                                {Object.keys(selectedItems).length} ürün seçili
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Summary */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                <h4 className="font-bold text-green-900 flex items-center gap-2 mb-2">
                                    <Check className="w-5 h-5" /> Liste Özeti
                                </h4>
                                <ul className="text-sm text-green-800 space-y-1">
                                    <li><strong>Adı:</strong> {name}</li>
                                    <li><strong>Tür:</strong> {type.toUpperCase()}</li>
                                    <li><strong>Para Birimi:</strong> {currency}</li>
                                    <li><strong>Toplam Kalem:</strong> {Object.keys(selectedItems).length}</li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 rounded-lg border border-gray-200 max-h-80 overflow-y-auto p-4">
                                <h5 className="text-xs font-bold text-gray-500 uppercase mb-3">Seçilen ve Fiyatlandırılan Ürünler</h5>
                                <div className="space-y-2">
                                    {Object.values(selectedItems).map(item => {
                                        const variant = variants.find(v => v.id === item.variantId);
                                        if (!variant) return null;
                                        return (
                                            <div key={item.variantId} className="flex justify-between items-center text-sm bg-white p-2 rounded shadow-sm border border-gray-100">
                                                <span className="truncate flex-1 font-medium">{variant.product_name} - {variant.name}</span>
                                                <span className="font-mono font-bold text-yellow-700 ml-4">
                                                    {item.customPrice ? item.customPrice.toFixed(2) : '-'} {currency}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center rounded-b-xl">
                    <button
                        onClick={handleBack}
                        disabled={step === 1 || saving}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors flex items-center gap-1"
                    >
                        <ChevronLeft className="w-4 h-4" /> Geri
                    </button>

                    <div className="flex gap-2">
                        {step < 3 ? (
                            <button
                                onClick={handleNext}
                                className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors flex items-center gap-2"
                            >
                                İleri <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSaveList}
                                disabled={saving}
                                className="px-6 py-2 bg-[#f0c961] text-black rounded-lg text-sm font-bold hover:bg-[#e0b850] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                                        Oluşturuluyor...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" /> Listeyi Oluştur
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PriceListWizard;
