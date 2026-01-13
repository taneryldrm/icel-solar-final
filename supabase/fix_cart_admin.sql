-- 1. ADMİN YETKİSİ DÜZELTME
-- Doğru mail adresi: koyuncukerem36@gmail.com (Ekrandan görülen)
UPDATE public.profiles
SET role = 'admin'
FROM auth.users
WHERE public.profiles.id = auth.users.id
AND auth.users.email = 'koyuncukerem36@gmail.com'; 

-- 2. SEPET SORUNU DÜZELTME (Unique Index)
-- Sadece 'active' statüsünde olan sepetler için benzersizlik kuralı ekle.
-- Bu sayede bir kullanıcının aynı anda sadece 1 aktif sepeti olabilir.
CREATE UNIQUE INDEX IF NOT EXISTS idx_carts_active_profile 
ON carts (profile_id) 
WHERE status = 'active';
