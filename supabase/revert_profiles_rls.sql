-- ACİL DÜZELTME v2: Hata almadan çalışması için

-- 1. Önce bütün olası conflict policyleri sil
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- 2. Profilleri herkese görünür yap (Siteyi açar)
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- 3. Kullanıcının kendi profilini güncellemesi (Hata veren kısım burasıydı, şimdi temizlendiği için çalışacak)
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
