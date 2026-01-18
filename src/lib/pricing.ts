import { supabase } from './supabaseClient';

/**
 * Fetches the current user's role from the profiles table.
 * Returns 'b2b' or 'b2c' (default 'b2c' if null/guest).
 */
export const fetchUserRole = async (): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return 'b2c';

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

    return profile?.role || 'b2c';
};

/**
 * İndirim bilgisi interface'i
 */
export interface PriceResult {
    finalPrice: number;
    originalPrice: number;
    hasDiscount: boolean;
    discountPercentage: number;
}

/**
 * İndirimin aktif olup olmadığını kontrol eder
 */
export const isDiscountActive = (
    discountPercentage: number,
    startDate?: string | null,
    endDate?: string | null
): boolean => {
    if (!discountPercentage || discountPercentage <= 0) return false;

    const now = new Date();

    if (startDate && new Date(startDate) > now) return false;
    if (endDate && new Date(endDate) < now) return false;

    return true;
};

/**
 * İndirimli fiyat hesaplar
 */
export const applyDiscount = (
    price: number,
    discountPercentage: number
): number => {
    if (discountPercentage <= 0 || discountPercentage > 100) return price;
    return price * (1 - discountPercentage / 100);
};

/**
 * Calculates the selling price for a variant based on the user's role and discount.
 * 
 * Logic:
 * 1. If role is NOT 'b2b', use basePrice.
 * 2. If role IS 'b2b', fetch active price from variant_prices.
 * 3. Apply discount if active.
 */
export const calculateVariantPrice = async (
    variantId: string,
    basePrice: number,
    userRole: string,
    discountPercentage: number = 0,
    discountStartDate?: string | null,
    discountEndDate?: string | null
): Promise<number> => {
    let price = basePrice;

    // B2B özel fiyat kontrolü
    if (userRole === 'b2b') {
        const { data: priceData } = await supabase
            .from('variant_prices')
            .select('price')
            .eq('variant_id', variantId)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1);

        if (priceData && priceData.length > 0) {
            price = priceData[0].price;
        }
    }

    // İndirim uygula (hem B2B hem B2C için)
    if (isDiscountActive(discountPercentage, discountStartDate, discountEndDate)) {
        price = applyDiscount(price, discountPercentage);
    }

    return price;
};

/**
 * Varyant için tam fiyat bilgisi döndürür (indirim detayları dahil)
 */
export const calculateVariantPriceWithDetails = async (
    variantId: string,
    basePrice: number,
    userRole: string,
    discountPercentage: number = 0,
    discountStartDate?: string | null,
    discountEndDate?: string | null
): Promise<PriceResult> => {
    let originalPrice = basePrice;

    // B2B özel fiyat kontrolü
    if (userRole === 'b2b') {
        const { data: priceData } = await supabase
            .from('variant_prices')
            .select('price')
            .eq('variant_id', variantId)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1);

        if (priceData && priceData.length > 0) {
            originalPrice = priceData[0].price;
        }
    }

    // İndirim kontrolü
    const hasDiscount = isDiscountActive(discountPercentage, discountStartDate, discountEndDate);
    const finalPrice = hasDiscount ? applyDiscount(originalPrice, discountPercentage) : originalPrice;

    return {
        finalPrice,
        originalPrice,
        hasDiscount,
        discountPercentage: hasDiscount ? discountPercentage : 0
    };
};

