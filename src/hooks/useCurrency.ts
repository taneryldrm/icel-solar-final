import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';

const CACHE_KEY = 'solar_usd_rate';
const DEFAULT_RATE = 35.00;

// Get cached rate from localStorage for immediate use
const getCachedRate = (): number => {
    if (typeof window === 'undefined') return DEFAULT_RATE;
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const parsed = JSON.parse(cached);
            // Use cached value if it's less than 1 hour old
            if (parsed.timestamp && Date.now() - parsed.timestamp < 3600000) {
                return parsed.rate;
            }
        }
    } catch {
        // Invalid cache, use default
    }
    return DEFAULT_RATE;
};

const setCachedRate = (rate: number) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            rate,
            timestamp: Date.now()
        }));
    } catch {
        // localStorage not available
    }
};

export const useCurrency = () => {
    // All hooks at the top in consistent order
    const [rate, setRate] = useState<number>(() => getCachedRate());
    const [loading, setLoading] = useState(true);

    // Define fetchRate function
    const fetchRate = useCallback(async () => {
        try {
            const { data } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'usd_rate')
                .single();

            if (data && data.value) {
                const newRate = Number(data.value);
                setRate(newRate);
                setCachedRate(newRate);
            }
        } catch (error) {
            console.error('Error fetching currency rate:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect for initial fetch and subscription
    useEffect(() => {
        fetchRate();

        const subscription = supabase
            .channel('public:settings')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings', filter: "key=eq.usd_rate" }, (payload: any) => {
                if (payload.new && payload.new.value) {
                    const newRate = Number(payload.new.value);
                    setRate(newRate);
                    setCachedRate(newRate);
                }
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchRate]);

    // Memoized functions that depend on rate
    const convertPrice = useMemo(() => {
        return (priceInUsd: number) => priceInUsd * rate;
    }, [rate]);

    const formatPrice = useMemo(() => {
        return (priceInUsd: number) => {
            const tlPrice = priceInUsd * rate;
            return tlPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TL';
        };
    }, [rate]);

    return {
        rate,
        loading,
        convertPrice,
        formatPrice,
        refreshRate: fetchRate
    };
};

