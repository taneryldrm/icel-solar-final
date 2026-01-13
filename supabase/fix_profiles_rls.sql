-- Profiller tablosu için RLS (Satır Düzeyi Güvenlik) Politikalarını Düzeltme

-- 1. Mevcut politikaları kontrol etmeyi/temizlemeyi deneyelim
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- 2. Politikaları Oluştur

-- Profil bilgilerini kimler görebilir?
-- Normalde "Public" olabilir ama biz Adminlerin kesinlikle görmesini istiyoruz.
-- Herkesin profilleri görmesi (örneğin yorumlarda isim vb.) gerekebilir, 
-- ama şimdilik sadece auth olanlar veya adminler üzerinden gidelim.
-- "Public profiles are viewable by everyone" genelde varsayılan gelir ama biz Admin için garantiye alalım.

CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles AS p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
  )
);

-- Kendi profilini görebilme (Gerekli)
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- NOT: Eğer sistemde "Public" görme varsa (örneğin yorumlarda kullanıcı adı), 
-- o zaman aşağıdaki satırı açabilirsiniz:
-- CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);


-- Adminlerin kullanıcıları düzenleyebilmesi/görüntüleyebilmesi için tam yetki
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles AS p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
  )
);
