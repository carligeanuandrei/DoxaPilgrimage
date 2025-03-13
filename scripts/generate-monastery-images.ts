import fs from 'fs';
import path from 'path';
import { db } from '../server/db';
import { monasteries } from '../shared/schema';

// Directoarele pentru imagini
const COVERS_DIR = path.join('public', 'images', 'monasteries', 'covers');
const ICONS_DIR = path.join('public', 'images', 'monasteries', 'icons');
const GALLERIES_DIR = path.join('public', 'images', 'monasteries', 'galleries');

// Asigură-te că directoarele există
function ensureDirectoryExists(directory: string) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

// Citește template-ul SVG
function getTemplateContent() {
  const templatePath = path.join('public', 'images', 'monasteries', 'monastery_template.svg');
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template-ul SVG nu există la calea: ${templatePath}`);
  }
  return fs.readFileSync(templatePath, 'utf8');
}

// Generează SVG personalizat pentru o mănăstire
function generateMonasterySvg(name: string, region: string) {
  const template = getTemplateContent();
  // Înlocuiește textul placeholder cu numele mănăstirii
  const customized = template
    .replace('Imagine Mănăstire (Placeholder)', name)
    .replace('Placeholder pentru imagini mănăstiri', `Regiunea: ${region}`);
  return customized;
}

// Salvează SVG-ul pentru o mănăstire
function saveMonasterySvg(slug: string, name: string, region: string, type: 'cover' | 'icon' | 'gallery1' | 'gallery2') {
  const svgContent = generateMonasterySvg(name, region);
  let fileName;
  let directory;
  
  if (type === 'cover') {
    fileName = `manastirea_${slug.toLowerCase().replace(/-/g, '_')}.svg`;
    directory = COVERS_DIR;
  } else if (type === 'icon') {
    fileName = `manastirea_${slug.toLowerCase().replace(/-/g, '_')}_icon.svg`;
    directory = ICONS_DIR;
  } else if (type === 'gallery1') {
    fileName = `manastirea_${slug.toLowerCase().replace(/-/g, '_')}_1.svg`;
    directory = GALLERIES_DIR;
  } else {
    fileName = `manastirea_${slug.toLowerCase().replace(/-/g, '_')}_2.svg`;
    directory = GALLERIES_DIR;
  }
  
  const filePath = path.join(directory, fileName);
  fs.writeFileSync(filePath, svgContent);
  return filePath;
}

async function generateAllMonasteryImages() {
  // Asigură-te că directoarele există
  ensureDirectoryExists(COVERS_DIR);
  ensureDirectoryExists(ICONS_DIR);
  ensureDirectoryExists(GALLERIES_DIR);
  
  console.log('Se generează imagini pentru mănăstiri...');
  
  // Obține toate mănăstirile din baza de date
  const allMonasteries = await db.select().from(monasteries);
  
  let generatedFiles = 0;
  for (const monastery of allMonasteries) {
    // Generează și salvează fiecare tip de imagine
    saveMonasterySvg(monastery.slug, monastery.name, monastery.region, 'cover');
    saveMonasterySvg(monastery.slug, monastery.name, monastery.region, 'icon');
    saveMonasterySvg(monastery.slug, monastery.name, monastery.region, 'gallery1');
    saveMonasterySvg(monastery.slug, monastery.name, monastery.region, 'gallery2');
    generatedFiles += 4;
    
    console.log(`Generate imagini pentru: ${monastery.name}`);
  }
  
  console.log(`Proces încheiat. Au fost generate ${generatedFiles} imagini SVG.`);
  console.log(`Actualizează baza de date pentru a folosi noile imagini SVG în loc de cele JPG.`);
}

// Execută funcția principală
generateAllMonasteryImages()
  .then(() => {
    console.log('Script finalizat cu succes!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Eroare în timpul executării script-ului:', error);
    process.exit(1);
  });