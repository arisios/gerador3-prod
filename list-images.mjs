import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import fs from 'fs';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);

console.log('🖼️  Listando todas as imagens do projeto...\n');

// Buscar imagens de slides de projetos
const [projectSlides] = await connection.query(`
  SELECT id, contentId, imageUrl, imagePrompt 
  FROM slides 
  WHERE imageUrl IS NOT NULL
`);

// Buscar imagens de slides de influenciadores
const [influencerSlides] = await connection.query(`
  SELECT id, contentId, imageUrl, imagePrompt 
  FROM influencerSlides 
  WHERE imageUrl IS NOT NULL
`);

// Buscar fotos de referência de influenciadores
const [influencers] = await connection.query(`
  SELECT id, name, referenceImageUrl 
  FROM influencers 
  WHERE referenceImageUrl IS NOT NULL
`);

// Buscar referências de produtos
const [productRefs] = await connection.query(`
  SELECT id, product_id as productId, url as imageUrl 
  FROM influencerProductReferences 
  WHERE url IS NOT NULL
`);

const imageList = {
  exportDate: new Date().toISOString(),
  summary: {
    projectSlides: projectSlides.length,
    influencerSlides: influencerSlides.length,
    influencerPhotos: influencers.length,
    productReferences: productRefs.length,
    total: projectSlides.length + influencerSlides.length + influencers.length + productRefs.length
  },
  images: {
    projectSlides: projectSlides.map(s => ({
      id: s.id,
      contentId: s.contentId,
      url: s.imageUrl,
      prompt: s.imagePrompt
    })),
    influencerSlides: influencerSlides.map(s => ({
      id: s.id,
      contentId: s.contentId,
      url: s.imageUrl,
      prompt: s.imagePrompt
    })),
    influencerPhotos: influencers.map(i => ({
      id: i.id,
      name: i.name,
      url: i.referenceImageUrl
    })),
    productReferences: productRefs.map(p => ({
      id: p.id,
      productId: p.productId,
      url: p.imageUrl
    }))
  }
};

const jsonPath = '/home/ubuntu/gerador3/backups/images-list.json';
fs.writeFileSync(jsonPath, JSON.stringify(imageList, null, 2));

console.log(`✅ Lista de imagens salva em: ${jsonPath}\n`);
console.log(`📊 Total de imagens:`);
console.log(`  - Slides de projetos: ${projectSlides.length}`);
console.log(`  - Slides de influenciadores: ${influencerSlides.length}`);
console.log(`  - Fotos de influenciadores: ${influencers.length}`);
console.log(`  - Referências de produtos: ${productRefs.length}`);
console.log(`  - TOTAL: ${imageList.summary.total} imagens\n`);
console.log(`🔗 Todas as URLs são permanentes (Amazon S3)`);

await connection.end();
