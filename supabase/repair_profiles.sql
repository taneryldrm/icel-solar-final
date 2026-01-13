-- EKSİK PROFİLLERİ ONARMA KOMUTU (GÜNCEL)
-- "customer" yerine sisteminizdeki "b2c" rolü kullanıldı.

INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', 'Kullanıcı'), 
  'b2c' -- Varsayılan rol: b2c
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- ADMİN YETKİSİNİ GÜNCELLE
UPDATE public.profiles
SET role = 'admin'
FROM auth.users
WHERE public.profiles.id = auth.users.id
AND auth.users.email = 'koyuncukerem36@gmail.com'; 

-- VARSA YANLIŞLIKLA 'customer' OLANLARI DÜZELT
UPDATE public.profiles
SET role = 'b2c'
WHERE role = 'customer';
