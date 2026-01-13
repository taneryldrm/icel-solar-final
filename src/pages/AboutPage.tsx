
import React from 'react';
import { motion } from 'framer-motion';

const AboutPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#fefcf5]">
            {/* Header Section */}
            <div className="bg-[#1a1a1a] text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#f0c961]/10 transform -skew-y-3 scale-110 translate-y-10" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black mb-4 tracking-tight"
                    >
                        Hakkımızda
                    </motion.h1>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100px" }}
                        className="h-1.5 bg-[#f0c961] mx-auto rounded-full"
                    />
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-16 md:py-24">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100">
                    <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="font-medium text-xl text-gray-900"
                        >
                            Yol Mühendislik Enerji Sistemleri Elektrik Makina İnşaat Taahhüt Ticaret Limited Şirketi, 2021 yılında yenilenebilir enerji alanında mühendislik temelli, sürdürülebilir ve yüksek verimli çözümler üretmek amacıyla kurulmuştur.
                        </motion.p>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            Kuruluşumuzdan bu yana; enerji sistemlerinin yalnızca kurulumdan ibaret olmadığı bilinciyle, tasarım esasına dayalı mühendislik yaklaşımını benimseyerek projeler üretmekteyiz. En küçük bireysel uygulamalardan büyük ölçekli arazi ve endüstriyel kurulumlara kadar; off-grid, on-grid, hibrit, tarımsal sulama ve komplike yenilenebilir enerji sistemlerini anahtar teslim olarak projelendiriyor ve hayata geçiriyoruz.
                        </motion.p>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            Tüm projelerimizde; doğru keşif, ihtiyaca uygun sistem tasarımı, kaliteli ekipman seçimi ve profesyonel uygulama süreçlerini bir bütün olarak ele alıyoruz. Malzemeli kurulum, devreye alma, test ve teknik destek hizmetlerini Türkiye’nin tüm bölgelerinde kesintisiz şekilde sunuyoruz.
                        </motion.p>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                        >
                            Firmamızın kurucusu ve Yönetim Kurulu Başkanı Elektrik-Elektronik Mühendisi <span className="font-bold text-[#1a1a1a]">Kamil Kara</span> liderliğinde; teknik yeterliliği yüksek, sahada deneyimli ve sürekli gelişimi esas alan bir ekip ile çalışmalarımızı sürdürmekteyiz. Mühendislik disiplini, iş güvenliği ve mevzuata uygunluk tüm faaliyetlerimizin temelini oluşturmaktadır.
                        </motion.p>

                        <div className="bg-[#fefcf5] p-6 rounded-2xl border-l-4 border-[#f0c961] my-8">
                            <p className="mb-0">
                                Ayrıca perakende markamız <span className="font-bold text-[#1a1a1a]">İçel Solar Market</span> ile yenilenebilir enerji sektöründe kullanılan ürünlerin satışını gerçekleştiriyor; bireysel ve kurumsal müşterilerimize doğru ürün seçimi konusunda danışmanlık desteği sağlıyoruz. Amacımız, yalnızca ürün satmak değil; doğru sistemin doğru şekilde kurulmasını garanti altına almaktır.
                            </p>
                        </div>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                        >
                            Yol Mühendislik Enerji Sistemleri olarak; çevreye duyarlı, ekonomik ve uzun ömürlü enerji çözümleriyle, ülkemizin sürdürülebilir enerji dönüşümüne katkı sağlamayı ve müşterilerimiz için güvenilir bir çözüm ortağı olmayı ilke ediniyoruz.
                        </motion.p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
