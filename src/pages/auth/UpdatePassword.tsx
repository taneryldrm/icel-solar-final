import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const UpdatePassword: React.FC = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Oturum kontrolü (URL'deki token sayesinde oturum açılmış olmalı)
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // Eğer session yoksa bu sayfaya erişim olmamalı (veya hash'teki token işlenmeli)
                // Supabase auth helper genelde URL'deki token'ı otomatik işleyip session kurar.
                // Eğer session gelmezse login'e yönlendir.
                navigate('/login');
            }
        };
        checkSession();
    }, [navigate]);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            alert("Şifreniz başarıyla güncellendi! Giriş sayfasına yönlendiriliyorsunuz.");
            navigate('/login');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-sans text-gray-900 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Yeni Şifre Belirle</h2>
                    <p className="text-gray-500 mt-2 text-sm">Lütfen hesabınız için yeni bir şifre girin.</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Yeni Şifre</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-[#6D4C41] focus:ring-1 focus:ring-[#6D4C41] outline-none transition-all placeholder-gray-400 text-sm"
                            placeholder="Yeni şifreniz"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3.5 px-4 bg-[#6D4C41] hover:bg-[#5D4037] text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#6D4C41] disabled:opacity-50 disabled:cursor-not-allowed
                        ${loading ? 'cursor-wait opacity-80' : ''}`}
                    >
                        {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdatePassword;
