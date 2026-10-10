import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const dir = dirname(fileURLToPath(import.meta.url));
const SUPABASE_URL = process.env.SEED_SUPABASE_URL;
const ANON_KEY = process.env.SEED_ANON_KEY;
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;
const BUCKET = 'product-images';
const IMG_DIR = join(dir, 'seed-images');

const supabase = createClient(SUPABASE_URL, ANON_KEY);

// Sign in as admin (needed for storage upload + product insert per RLS)
const { error: signInErr } = await supabase.auth.signInWithPassword({
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
});
if (signInErr) {
  console.error('SIGNIN FAILED:', signInErr.message);
  process.exit(1);
}
console.log('Signed in as admin.');

// 1. Upload images
const products = JSON.parse(readFileSync(join(IMG_DIR, 'products.json'), 'utf8'));
let uploaded = 0;
for (const p of products) {
  const buf = readFileSync(join(IMG_DIR, p.image));
  const { error } = await supabase.storage.from(BUCKET).upload(p.image, buf, {
    contentType: 'image/jpeg',
    upsert: true,
  });
  if (error) {
    console.error('UPLOAD FAILED:', p.image, error.message);
  } else {
    uploaded++;
  }
}
console.log(`Uploaded ${uploaded}/${products.length} images.`);

// 2. Insert products (skip ones already present by name)
const { data: existing } = await supabase.from('products').select('name');
const existingNames = new Set((existing || []).map((r) => r.name));
const rows = products
  .filter((p) => !existingNames.has(p.name))
  .map((p) => ({
    name: p.name,
    price: p.price,
    category: p.category,
    sizes: p.sizes,
    colors: p.colors,
    description: p.description,
    fabric: p.fabric,
    images: [`${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${p.image}`],
    in_stock: true,
    featured: !!p.featured,
    is_new: !!p.is_new,
  }));

if (rows.length === 0) {
  console.log('All products already exist, nothing to insert.');
} else {
  const { error: insErr } = await supabase.from('products').insert(rows);
  if (insErr) {
    console.error('INSERT FAILED:', insErr.message);
    process.exit(1);
  }
  console.log(`Inserted ${rows.length} products.`);
}

// 3. Verify
const { count } = await supabase.from('products').select('id', { count: 'exact', head: true });
console.log('Total products in DB:', count);
await supabase.auth.signOut();
console.log('DONE');
