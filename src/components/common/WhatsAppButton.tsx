import React from 'react';

const WhatsAppButton: React.FC = () => {
    const phoneNumber = "905387677071"; // Güncel numara
    const whatsappUrl = `https://wa.me/${phoneNumber}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 group flex items-center justify-center"
            aria-label="WhatsApp ile iletişime geçin"
        >
            {/* Tooltip (Desktop Only) */}
            <span className="hidden md:block absolute right-full mr-3 bg-white text-gray-800 text-sm font-semibold py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                WhatsApp Hattı
                {/* Küçük ok */}
                <span className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-white rotate-45"></span>
            </span>

            {/* Button */}
            <div className="bg-[#25D366] text-white p-3 md:p-4 rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1 hover:scale-110 relative">
                {/* Pulse Effect */}
                <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-75 animate-ping"></span>
                <span className="absolute inset-0 rounded-full bg-[#25D366]"></span>

                {/* Icon (SVG) */}
                <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 448 512"
                    className="w-8 h-8 md:w-10 md:h-10 relative z-10"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-27.5l-6.8-4.4-69.8 18.3 18.6-68.1-4.4-6.9c-19-30.2-29-64.9-29-99.5 0-101.5 82.6-184.1 184.1-184.1 49.1 0 95.4 19.1 130.1 53.9 34.8 34.7 53.9 80.9 53.9 130.1 0 101.4-82.6 184.1-184.1 184.1zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path>
                </svg>
            </div>
        </a>
    );
};

export default WhatsAppButton;
