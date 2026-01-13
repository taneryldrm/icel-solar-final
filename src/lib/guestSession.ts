/**
 * Guest Session Management
 * Misafir kullanıcılar için benzersiz session ID yönetimi
 */

const STORAGE_KEY = 'guest_session_id';
const SESSION_EXPIRY_DAYS = 7;

/**
 * Mevcut guest session ID'sini al veya yeni oluştur
 */
export const getOrCreateGuestSessionId = (): string => {
    let sessionId = localStorage.getItem(STORAGE_KEY);

    if (!sessionId) {
        // Benzersiz session ID oluştur: guest_timestamp_randomstring
        sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(STORAGE_KEY, sessionId);

        // Expiry date'i de sakla
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + SESSION_EXPIRY_DAYS);
        localStorage.setItem(`${STORAGE_KEY}_expiry`, expiryDate.toISOString());
    } else {
        // Session süresi dolmuş mu kontrol et
        const expiryStr = localStorage.getItem(`${STORAGE_KEY}_expiry`);
        if (expiryStr) {
            const expiryDate = new Date(expiryStr);
            if (new Date() > expiryDate) {
                // Süresi dolmuş, yeni oluştur
                clearGuestSession();
                return getOrCreateGuestSessionId();
            }
        }
    }

    return sessionId;
};

/**
 * Guest session'ı temizle (kullanıcı login olduğunda)
 */
export const clearGuestSession = (): void => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(`${STORAGE_KEY}_expiry`);
};

/**
 * Aktif guest session var mı kontrol et
 */
export const hasActiveGuestSession = (): boolean => {
    const sessionId = localStorage.getItem(STORAGE_KEY);
    return !!sessionId;
};

/**
 * Guest session ID'sini al (varsa)
 */
export const getGuestSessionId = (): string | null => {
    return localStorage.getItem(STORAGE_KEY);
};
