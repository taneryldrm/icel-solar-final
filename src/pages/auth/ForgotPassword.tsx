import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const redirectUrl = window.location.origin + '/update-password';
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: redirectUrl,
            });

            if (error) throw error;
            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-sans text-gray-900 p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="p-4 bg-green-50 rounded-full">
                            <Mail className="w-12 h-12 text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Sıfırlama Linki Gönderildi!</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Lütfen <span className="font-bold text-gray-900">{email}</span> adresine gönderdiğimiz linke tıklayarak şifrenizi sıfırlayın.
                    </p>
                    <Link
                        to="/login"
                        className="inline-block w-full py-3.5 px-4 bg-[#6D4C41] hover:bg-[#5D4037] text-white font-bold rounded-lg shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#6D4C41]"
                    >
                        Giriş Ekranına Dön
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-sans text-gray-900 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Şifremi Unuttum</h2>
                    <p className="text-gray-500 mt-2 text-sm">Hesabınıza ait e-posta adresini girin, size bir sıfırlama linki gönderelim.</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-[#6D4C41] focus:ring-1 focus:ring-[#6D4C41] outline-none transition-all placeholder-gray-400 text-sm"
                            placeholder="ornek@email.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3.5 px-4 bg-[#6D4C41] hover:bg-[#5D4037] text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#6D4C41] disabled:opacity-50 disabled:cursor-not-allowed
                        ${loading ? 'cursor-wait opacity-80' : ''}`}
                    >
                        {loading ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-sm text-gray-600 hover:text-[#6D4C41] font-medium transition-colors">
                        &larr; Giriş sayfasına dön
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
