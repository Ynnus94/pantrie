-- Metro Quebec Price Seed Data
-- Insert Metro Quebec baseline prices

INSERT INTO price_data (item_name, price, unit, store, source) VALUES
-- Proteins
('chicken breast', 12.99, 'per lb', 'Metro', 'metro_baseline'),
('chicken breast prime', 11.99, 'per lb', 'Metro', 'metro_baseline'),
('chicken breast organic', 16.99, 'per lb', 'Metro', 'metro_baseline'),
('chicken thighs', 5.99, 'per lb', 'Metro', 'metro_baseline'),
('ground beef lean', 9.29, 'per lb', 'Metro', 'metro_baseline'),
('salmon fillets', 18.99, 'per lb', 'Metro', 'metro_baseline'),

-- Pantry Staples  
('pasta penne', 2.49, 'per 454g box', 'Metro', 'metro_baseline'),
('pasta spaghetti', 2.49, 'per 454g box', 'Metro', 'metro_baseline'),
('rice basmati', 4.99, 'per 2kg bag', 'Metro', 'metro_baseline'),
('bread whole grain', 3.49, 'per loaf', 'Metro', 'metro_baseline'),
('milk 2%', 5.79, 'per 4L', 'Metro', 'metro_baseline'),
('eggs large', 4.49, 'per dozen', 'Metro', 'metro_baseline'),
('butter', 6.99, 'per 454g', 'Metro', 'metro_baseline'),
('olive oil', 8.99, 'per 500ml', 'Metro', 'metro_baseline'),

-- Produce (seasonal averages)
('onions yellow', 3.99, 'per 3lb bag', 'Metro', 'metro_baseline'),
('carrots', 2.99, 'per 2lb bag', 'Metro', 'metro_baseline'),
('potatoes russet', 4.99, 'per 5lb bag', 'Metro', 'metro_baseline'),
('sweet potatoes', 2.99, 'per lb', 'Metro', 'metro_baseline'),
('bell peppers', 1.99, 'each', 'Metro', 'metro_baseline'),
('spinach baby', 4.99, 'per 142g bag', 'Metro', 'metro_baseline'),
('tomatoes', 4.99, 'per lb', 'Metro', 'metro_baseline'),

-- Specialty Items (common adventure meal ingredients)
('kimchi', 5.99, 'per 400g jar', 'Asian Market', 'specialty_estimate'),
('golden curry paste', 4.99, 'per jar', 'Asian Market', 'specialty_estimate'),
('miso paste', 6.99, 'per container', 'Asian Market', 'specialty_estimate'),
('tahini', 8.99, 'per jar', 'Health Store', 'specialty_estimate'),
('coconut milk', 3.49, 'per 400ml can', 'Metro', 'metro_baseline');

