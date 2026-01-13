-- Tüm adminleri listele
SELECT id, email, role, full_name
FROM public.profiles
WHERE role = 'admin';
