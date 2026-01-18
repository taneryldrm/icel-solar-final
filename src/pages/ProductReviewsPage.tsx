import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ProductReviews from '../components/ProductReviews';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft } from 'lucide-react';

const ProductReviewsPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!slug) return;

            // 1. Ürünü Slug veya ID ile Çek
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
            const queryColumn = isUuid ? 'id' : 'slug';

            const { data, error } = await supabase
                .from('products')
                .select('id, name')
                .eq(queryColumn, slug)
                .single();

            if (data) {
                setProduct(data);
            } else {
                console.error('Ürün bulunamadı:', error);
                navigate('/products'); // Hata durumunda listeye dön
            }
            setLoading(false);
        };

        fetchProduct();
    }, [slug, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fffaf4]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#f0c961] border-t-transparent"></div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="min-h-screen bg-[#fffaf4] py-8 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Header / Back Button */}
                <div className="mb-8">
                    <Link to={`/products/${slug}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-[#f0c961] font-bold transition-colors mb-4">
                        <ArrowLeft className="w-5 h-5" />
                        Ürüne Dön
                    </Link>
                    <h1 className="text-3xl font-black text-[#1a1a1a]">
                        {product.name} - Değerlendirmeler
                    </h1>
                </div>

                {/* Reviews Component */}
                <ProductReviews productId={product.id} />
            </div>
        </div>
    );
};

export default ProductReviewsPage;
