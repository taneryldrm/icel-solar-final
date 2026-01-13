
import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const ContactPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#fefcf5]">
            {/* Header */}
            <div className="bg-[#1a1a1a] text-white py-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#f0c961]/10 transform skew-y-3 scale-110 -translate-y-6" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-4xl font-black mb-2"
                    >
                        İletişim
                    </motion.h1>
                    <p className="text-gray-400">Bizimle iletişime geçin</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 md:py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">

                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <div>
                            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">İletişim Bilgileri</h2>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Görüş, öneri ve talepleriniz için bize aşağıdaki iletişim kanallarından ulaşabilirsiniz.
                                Ekibimiz en kısa sürede size dönüş yapacaktır.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                <div className="bg-[#f0c961]/20 p-3 rounded-full text-[#b89028]">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Telefon</h3>
                                    <p className="text-gray-600">0538 767 70 71</p>
                                    <p className="text-gray-600">0324 336 63 36</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                <div className="bg-[#f0c961]/20 p-3 rounded-full text-[#b89028]">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">E-posta</h3>
                                    <p className="text-gray-600">info@icelsolarmarket.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                <div className="bg-[#f0c961]/20 p-3 rounded-full text-[#b89028]">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Adres</h3>
                                    <a
                                        href="https://maps.app.goo.gl/s3YtjXsFTfuLDjRg9?g_st=ic"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-600 hover:text-[#f0c961] transition-colors"
                                    >
                                        Barış, Bahçeler Cd. Eroğlu Plaza No:30/21, 33010 Akdeniz/Mersin
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                <div className="bg-[#f0c961]/20 p-3 rounded-full text-[#b89028]">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Çalışma Saatleri</h3>
                                    <p className="text-gray-600">Pazartesi - Cuma: 09:00 - 18:00</p>
                                    <p className="text-gray-600">Cumartesi: 09:00 - 13:00</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Map or Decoration */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-100 rounded-3xl overflow-hidden min-h-[400px] relative shadow-lg"
                    >
                        <iframe
                            src="https://maps.google.com/maps?q=36.8011224,34.6176528&hl=tr&z=17&output=embed"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="absolute inset-0 grayscale px-0"
                            title="Konum Haritası"
                        />
                        <a
                            href="https://maps.app.goo.gl/s3YtjXsFTfuLDjRg9?g_st=ic"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-4 right-4 bg-white text-gray-900 px-4 py-2 rounded-lg shadow-lg font-bold text-sm hover:bg-[#f0c961] transition-colors flex items-center gap-2"
                        >
                            Haritada Aç <MapPin className="w-4 h-4" />
                        </a>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default ContactPage;
