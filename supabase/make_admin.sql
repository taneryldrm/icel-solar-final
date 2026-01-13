-- Kullanıcıya Admin Yetkisi Verme
-- Mail adresi: koyuncukerem3@gmail.com

UPDATE public.profiles
SET role = 'admin'
FROM auth.users
WHERE public.profiles.id = auth.users.id
AND auth.users.email = 'koyuncukerem3@gmail.com'; 
