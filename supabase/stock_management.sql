-- 1. CONSTRAINT: Stok miktarının negatif olmasını engelle
ALTER TABLE product_variants
ADD CONSTRAINT stock_non_negative CHECK (stock >= 0);

-- 2. FUNCTION: Sipariş verildiğinde stoğu düşüren fonksiyon
CREATE OR REPLACE FUNCTION decrement_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Yeni sipariş edilen ürünün (variant) stoğunu azalt
  UPDATE product_variants
  SET stock = stock - NEW.quantity
  WHERE id = NEW.variant_id;
  
  -- Eğer constraint ihlali olursa (stok < 0), PostgreSQL otomatik olarak hata fırlatır
  -- ve işlem (sipariş oluşturma) iptal edilir.
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. TRIGGER: order_items tablosuna ekleme yapıldığında çalışır
DROP TRIGGER IF EXISTS decrement_stock_trigger ON order_items;

CREATE TRIGGER decrement_stock_trigger
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION decrement_stock();
