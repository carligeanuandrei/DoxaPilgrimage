/**
 * Script pentru inițializarea rețetelor de post demonstrative
 */

import { db } from '../server/db';
import { fastingRecipes } from '../shared/schema';
import { eq, sql } from 'drizzle-orm';
import slugify from 'slugify';

interface FastingRecipeData {
  title: string;
  description: string;
  recipeType: string; 
  category: string;
  difficulty: string;
  preparationMinutes: number;
  cookingMinutes: number;
  preparationTime: string;
  servings: number;
  calories?: number;
  ingredients: string[];
  steps: string[];
  imageUrl?: string;
  source?: string;
  isFeatured?: boolean;
  monasteryId?: number;
  recommendedForDays?: string[];
  occasionTags?: string[];
  feastDay?: string;
}

/**
 * Funcție pentru generarea unui slug unic
 */
function generateSlug(title: string): string {
  return slugify(title, {
    lower: true,
    strict: true,
    locale: 'ro'
  });
}

/**
 * Funcția principală pentru inițializarea rețetelor de post
 */
async function initFastingRecipes() {
  try {
    console.log('🌱 Inițializăm rețetele de post demonstrative...');

    // Verifică dacă există deja rețete
    try {
      const existingRecipes = await db.execute(sql`SELECT COUNT(*) FROM fasting_recipes`);
      
      if (existingRecipes && existingRecipes.rows && existingRecipes.rows.length > 0) {
        const count = Number(existingRecipes.rows[0].count);
        if (count > 0) {
          console.log(`⚠️ Există deja ${count} rețete în baza de date.`);
          const overwrite = process.argv.includes('--overwrite');
          
          if (overwrite) {
            console.log('🔄 Opțiunea --overwrite detectată. Ștergem rețetele existente...');
            await db.execute(sql`DELETE FROM fasting_recipes`);
          } else {
            console.log('ℹ️ Pentru a suprascrie rețetele existente, rulați script-ul cu opțiunea --overwrite');
            return;
          }
        }
      }
    } catch (error) {
      console.log('ℹ️ Nu s-au putut verifica rețetele existente, vom continua cu adăugarea de rețete noi.');
      console.error(error);
    }

    // Rețete demonstrative
    const demoRecipes: FastingRecipeData[] = [
      {
        title: 'Ciorbă de legume cu leuștean',
        description: 'O ciorbă aromată și sănătoasă, perfectă pentru zilele de post. Conține o varietate de legume și este condimentată cu leuștean proaspăt.',
        recipeType: 'de_post',
        category: 'supe_si_ciorbe',
        difficulty: 'incepator',
        preparationMinutes: 15,
        cookingMinutes: 45,
        preparationTime: 'sub_30_minute',
        servings: 6,
        calories: 120,
        ingredients: [
          '2 morcovi',
          '1 păstârnac',
          '1 țelină mică',
          '1 ceapă',
          '1 ardei gras',
          '2 cartofi',
          '1 legătură de leuștean',
          '2 linguri ulei de măsline',
          'sare și piper după gust',
          'zeamă de lămâie după gust'
        ],
        steps: [
          'Spălați și curățați toate legumele.',
          'Tăiați legumele în cuburi mici.',
          'Încingeți uleiul într-o oală și căliti ușor ceapa.',
          'Adăugați restul legumelor și căliți-le pentru 5 minute.',
          'Adăugați apă până acoperiți legumele și lăsați să fiarbă la foc mediu pentru 30-40 minute.',
          'Când legumele sunt fierte, adăugați leușteanul tocat.',
          'Condimentați cu sare, piper și zeamă de lămâie după gust.',
          'Serviți fierbinte, cu ardei iute pentru cei care preferă.'
        ],
        imageUrl: '/public/images/demo/ciorba-legume.jpg',
        isFeatured: true,
        recommendedForDays: ['monday', 'wednesday', 'friday'],
        occasionTags: ['postul_pastelui', 'postul_craciunului']
      },
      {
        title: 'Sarmale de post cu ciuperci și orez',
        description: 'Sarmale delicioase pentru perioadele de post, umplute cu ciuperci, orez și legume aromate.',
        recipeType: 'cu_dezlegare_la_ulei',
        category: 'feluri_principale',
        difficulty: 'mediu',
        preparationMinutes: 45,
        cookingMinutes: 120,
        preparationTime: 'peste_60_minute',
        servings: 8,
        calories: 210,
        ingredients: [
          '1 varză murată',
          '500g ciuperci champignon',
          '200g orez cu bob rotund',
          '2 cepe mari',
          '2 morcovi',
          '1 ardei gras',
          '1 legătură de mărar',
          '1 legătură de pătrunjel',
          '3 linguri pastă de tomate',
          '100ml ulei',
          'sare și piper după gust',
          'cimbru, foi de dafin'
        ],
        steps: [
          'Desfaceți frunzele de varză murată și spălați-le în câteva ape reci dacă sunt prea sărate.',
          'Tăiați ciupercile și legumele fin sau dați-le prin mașina de tocat.',
          'Caliti ceapa în puțin ulei, apoi adăugați morcovul și ardeiul.',
          'Când legumele s-au înmuiat, adăugați ciupercile și continuați să căliti până când acestea își lasă apa.',
          'Adăugați orezul (spălat în câteva ape în prealabil), amestecați și căliti 2-3 minute.',
          'Adăugați pătrunjel și mărar tocat, sare, piper și alte condimente după gust.',
          'Luați frunzele de varză, puneți o lingură de compoziție și împachetați sarmalele.',
          'Așezați un strat de varză tocată pe fundul unei oale mari, apoi aranjați sarmalele.',
          'Între straturi, puneți foi de dafin și bucățele de varză.',
          'Amestecați pasta de tomate cu apă și turnați peste sarmale până le acoperiți complet.',
          'Fierbeți la foc mic pentru aproximativ 2 ore.',
          'Serviți calde, cu mămăligă și ardei iute.'
        ],
        imageUrl: '/public/images/demo/sarmale-post.jpg',
        isFeatured: true,
        recommendedForDays: ['monday', 'wednesday', 'friday', 'saturday', 'sunday'],
        occasionTags: ['postul_pastelui', 'postul_craciunului', 'sarbatori']
      },
      {
        title: 'Fasole bătută cu ceapă călită',
        description: 'Un preparat tradițional românesc, perfect pentru zilele de post. Fasolea bătută este un fel de mâncare sățios și gustos.',
        recipeType: 'cu_dezlegare_la_ulei',
        category: 'feluri_principale',
        difficulty: 'incepator',
        preparationMinutes: 15,
        cookingMinutes: 90,
        preparationTime: 'peste_60_minute',
        servings: 6,
        calories: 250,
        ingredients: [
          '500g fasole albă uscată',
          '2 cepe mari',
          '5-6 căței de usturoi',
          '100ml ulei',
          'sare și piper după gust',
          'cimbru uscat',
          'opțional: ardei copți'
        ],
        steps: [
          'Înainte de a începe prepararea, puneți fasolea la înmuiat de seara până dimineața.',
          'Scurgeți apa în care a stat fasolea și clătiți bine.',
          'Puneți fasolea într-o oală cu apă rece și fierbeți până când boabele se înmoaie complet (aproximativ 60-90 minute).',
          'Între timp, tocați ceapa mărunt și căliti-o în ulei până devine transparentă și aurie.',
          'Când fasolea este fiartă, scurgeți-o dar păstrați puțin din zeama de fierbere.',
          'Zdrobiți fasolea cu un blender sau cu un zdrobitor de cartofi.',
          'Adăugați usturoiul pisat, sare, piper și cimbru după gust.',
          'Amestecați bine și adăugați din zeama de fierbere dacă compoziția este prea groasă.',
          'Serviți cu ceapa călită deasupra și ardei copți (opțional).',
          'Se potrivește perfect cu murături sau salată de ceapă roșie.'
        ],
        imageUrl: '/public/images/demo/fasole-batuta.jpg',
        isFeatured: false,
        recommendedForDays: ['monday', 'wednesday', 'friday'],
        occasionTags: ['postul_pastelui', 'postul_craciunului']
      },
      {
        title: 'Salată de vinete coapte',
        description: 'O salată aromată de vinete coapte, perfectă ca aperitiv sau garnitură în perioadele de post.',
        recipeType: 'cu_dezlegare_la_ulei',
        category: 'salate',
        difficulty: 'incepator',
        preparationMinutes: 20,
        cookingMinutes: 45,
        preparationTime: '30_60_minute',
        servings: 4,
        calories: 150,
        ingredients: [
          '3 vinete mari',
          '1 ceapă roșie medie',
          '2-3 căței de usturoi',
          '100ml ulei de măsline',
          'sare și piper după gust',
          'zeamă de lămâie',
          'pătrunjel proaspăt pentru decor'
        ],
        steps: [
          'Spălați vinetele și înțepați-le în câteva locuri cu o furculiță.',
          'Coaceți vinetele pe grătar, în cuptor sau direct pe flacără până când pielea se carbonizează și interiorul devine moale.',
          'Lăsați vinetele să se răcească, apoi îndepărtați coaja și puneți-le într-o sită pentru a se scurge de zeamă (aproximativ 30 minute).',
          'Tocați fin ceapa și zdrobiți usturoiul.',
          'Tocați vinetele cu un cuțit cu lamă dreaptă până obțineți o pastă.',
          'Amestecați vinetele cu ceapa, usturoiul, sare și piper.',
          'Adăugați uleiul treptat, amestecând continuu pentru a se încorpora.',
          'La final, adăugați zeama de lămâie după gust.',
          'Decorați cu pătrunjel proaspăt tocat și serviți cu roșii proaspete.'
        ],
        imageUrl: '/public/images/demo/salata-vinete.jpg',
        isFeatured: false,
        recommendedForDays: ['monday', 'wednesday', 'friday'],
        occasionTags: ['post_zilnic', 'vara']
      },
      {
        title: 'Colivă tradițională',
        description: 'Coliva este un preparat dulce tradițional ortodox, servit la pomeni și parastase. Această rețetă este perfectă pentru perioadele de post.',
        recipeType: 'cu_dezlegare_la_ulei',
        category: 'deserturi',
        difficulty: 'mediu',
        preparationMinutes: 30,
        cookingMinutes: 40,
        preparationTime: '30_60_minute',
        servings: 10,
        calories: 280,
        ingredients: [
          '500g grâu pentru colivă',
          '250g zahăr',
          '150g nuci măcinate',
          '100g nucă de cocos',
          'coajă rasă de lămâie',
          'esență de rom',
          'scorțișoară măcinată',
          'nucă și miez de nucă pentru decor',
          'zahăr pudră pentru ornat',
          'biscuiți pentru decor'
        ],
        steps: [
          'Spălați grâul și puneți-l la înmuiat în apă rece peste noapte.',
          'A doua zi, clătiți grâul și puneți-l la fiert în apă cu sare, până când boabele se înmoaie bine.',
          'Scurgeți grâul și clătiți-l cu apă rece.',
          'Amestecați grâul fiert cu zahărul, nucile măcinate, nuca de cocos, coaja de lămâie și esența de rom.',
          'Adăugați scorțișoara după gust și amestecați bine.',
          'Modelați coliva pe un platou în formă de movilă.',
          'Nivelaţi suprafaţa şi decoraţi cu nucă, zahăr pudră și biscuiți.',
          'Puteți face modele sau cruci din biscuiți și nucă pentru un aspect tradițional.',
          'Lăsați coliva să se odihnească câteva ore înainte de servire pentru ca aromele să se îmbine.'
        ],
        imageUrl: '/public/images/demo/coliva.jpg',
        isFeatured: true,
        recommendedForDays: ['saturday'],
        occasionTags: ['postul_pastelui', 'postul_craciunului', 'parastase']
      },
      {
        title: 'Pilaf de post cu legume',
        description: 'Un pilaf aromat și sățios, perfect pentru zilele de post. Conține o varietate de legume și este ușor de preparat.',
        recipeType: 'cu_dezlegare_la_ulei',
        category: 'feluri_principale',
        difficulty: 'incepator',
        preparationMinutes: 15,
        cookingMinutes: 30,
        preparationTime: '30_60_minute',
        servings: 6,
        calories: 220,
        ingredients: [
          '400g orez cu bob lung',
          '2 morcovi',
          '1 ceapă',
          '1 ardei gras',
          '100g mazăre',
          '100g porumb',
          '3 linguri ulei',
          'sare și piper după gust',
          'boia dulce',
          'cimbru uscat',
          'pătrunjel proaspăt pentru decor'
        ],
        steps: [
          'Spălați orezul în mai multe ape până când apa rămâne clară.',
          'Tocați ceapa mărunt și tăiați morcovii și ardeiul în cubulețe mici.',
          'Încălziți uleiul într-o oală adâncă și căliți ceapa până devine translucidă.',
          'Adăugați morcovii și ardeiul și căliți pentru 3-4 minute.',
          'Adăugați orezul și căliți pentru 2 minute, amestecând continuu.',
          'Presărați boia dulce și cimbru uscat.',
          'Adăugați apă fierbinte sau supă de legume (de 2 ori volumul orezului) și amestecați.',
          'Aduceți la fierbere, apoi reduceți focul la minim, acoperiți oala și lăsați să fiarbă pentru 15-18 minute.',
          'Când orezul este aproape fiert, adăugați mazărea și porumbul.',
          'Lăsați să mai fiarbă 5 minute, apoi opriți focul și lăsați oala acoperită pentru alte 10 minute.',
          'Amestecați ușor cu o furculiță pentru a afâna orezul.',
          'Serviți presărat cu pătrunjel proaspăt tocat.'
        ],
        imageUrl: '/public/images/demo/pilaf-post.jpg',
        isFeatured: false,
        recommendedForDays: ['monday', 'wednesday', 'friday'],
        occasionTags: ['postul_pastelui', 'postul_craciunului']
      },
      {
        title: 'Plăcintă cu dovleac',
        description: 'O plăcintă dulce și aromată cu dovleac, perfectă pentru perioadele de post. Coaja crocantă și umplutura parfumată de dovleac o fac irezistibilă.',
        recipeType: 'cu_dezlegare_la_ulei',
        category: 'deserturi',
        difficulty: 'mediu',
        preparationMinutes: 40,
        cookingMinutes: 45,
        preparationTime: 'peste_60_minute',
        servings: 8,
        calories: 260,
        ingredients: [
          'Pentru aluat:',
          '500g făină',
          '200ml apă călduță',
          '100ml ulei',
          '1 linguriță sare',
          'Pentru umplutură:',
          '1kg dovleac curățat',
          '150g zahăr',
          '1 linguriță scorțișoară',
          '1/2 linguriță nucșoară',
          'coajă rasă de lămâie',
          '100g nucă măcinată (opțional)'
        ],
        steps: [
          'Pregătiți aluatul: într-un castron mare, amestecați făina cu sarea.',
          'Adăugați treptat apa călduță și uleiul, frământând până obțineți un aluat elastic.',
          'Împărțiți aluatul în două bile egale, acoperiți-le și lăsați-le să se odihnească 30 de minute.',
          'Între timp, pregătiți umplutura: răzuiți dovleacul pe răzătoarea mare.',
          'Amestecați dovleacul ras cu zahărul, scorțișoara, nucșoara și coaja de lămâie.',
          'Dacă folosiți nucă măcinată, adăugați-o acum în amestec.',
          'Întindeți prima bilă de aluat într-o foaie subțire și așezați-o într-o tavă unsă cu ulei.',
          'Distribuiți umplutura de dovleac uniform peste foaia de aluat.',
          'Întindeți a doua bilă de aluat și acoperiți umplutura.',
          'Sigilați marginile și înțepați suprafața plăcintei cu o furculiță pentru a permite aburului să iasă.',
          'Ungeți suprafața cu puțin ulei pentru o crustă aurie.',
          'Coaceți la 180°C pentru 40-45 de minute, până când plăcinta devine aurie.',
          'Lăsați plăcinta să se răcească puțin înainte de a o tăia și servi.'
        ],
        imageUrl: '/public/images/demo/placinta-dovleac.jpg',
        isFeatured: true,
        recommendedForDays: ['saturday', 'sunday'],
        occasionTags: ['postul_craciunului', 'toamna']
      },
      {
        title: 'Mâncare de cartofi cu mărar',
        description: 'O mâncare simplă și gustoasă, ideală pentru zilele de post. Cartofii sunt gătiți cu ceapă și mărar proaspăt pentru un gust delicios.',
        recipeType: 'cu_dezlegare_la_ulei',
        category: 'feluri_principale',
        difficulty: 'incepator',
        preparationMinutes: 15,
        cookingMinutes: 30,
        preparationTime: '30_60_minute',
        servings: 4,
        calories: 180,
        ingredients: [
          '1kg cartofi',
          '2 cepe mari',
          '1 legătură de mărar',
          '3 linguri ulei',
          'sare și piper după gust',
          'boia dulce',
          'apă sau supă de legume'
        ],
        steps: [
          'Curățați cartofii și tăiați-i în cuburi de mărime medie.',
          'Tocați ceapa mărunt și mărarul.',
          'Încălziți uleiul într-o oală și căliți ceapa până devine transparentă.',
          'Adăugați cartofii și căliți-i pentru câteva minute, amestecând ocazional.',
          'Presărați boia dulce, sare și piper după gust.',
          'Adăugați apă sau supă de legume până acoperiți cartofii pe jumătate.',
          'Acoperiți oala și lăsați să fiarbă la foc mediu până când cartofii sunt moi (aproximativ 20-25 minute).',
          'Când cartofii sunt fierți, adăugați mărarul tocat și amestecați ușor.',
          'Lăsați să mai fiarbă 2-3 minute și apoi opriți focul.',
          'Serviți cald, cu murături sau salată de varză.'
        ],
        imageUrl: '/public/images/demo/cartofi-marar.jpg',
        isFeatured: false,
        recommendedForDays: ['monday', 'wednesday', 'friday'],
        monasteryId: 15, // ID mănăstire demonstrativă
        occasionTags: ['postul_pastelui', 'postul_craciunului'],
        source: 'Rețetă tradițională de la Mănăstirea Putna'
      },
      {
        title: 'Ciuperci umplute la cuptor',
        description: 'Ciupercile umplute sunt un aperitiv delicios și aspectuos pentru mesele de post. Umplutura aromată de legume și ierburi aromatice face acest preparat irezistibil.',
        recipeType: 'cu_dezlegare_la_ulei',
        category: 'aperitive',
        difficulty: 'mediu',
        preparationMinutes: 20,
        cookingMinutes: 25,
        preparationTime: '30_60_minute',
        servings: 4,
        calories: 150,
        ingredients: [
          '12 ciuperci champignon mari',
          '1 ceapă mică',
          '1 ardei gras',
          '2 căței de usturoi',
          '50g pesmet',
          '2 linguri ulei de măsline',
          'pătrunjel proaspăt',
          'sare și piper după gust',
          'cimbru uscat'
        ],
        steps: [
          'Preîncălziți cuptorul la 180°C.',
          'Curățați ciupercile și scoateți cu grijă piciorușele, păstrând pălăriile intacte.',
          'Tocați mărunt piciorușele ciupercilor, ceapa, ardeiul și usturoiul.',
          'Încălziți uleiul într-o tigaie și căliți amestecul de legume pentru 5-7 minute.',
          'Adăugați pesmetul, pătrunjelul tocat, sare, piper și cimbru și amestecați bine.',
          'Umpleți pălăriile de ciuperci cu acest amestec.',
          'Așezați ciupercile umplute într-o tavă de copt și stropiți-le cu puțin ulei de măsline.',
          'Coaceți pentru 20-25 minute, până când ciupercile sunt moi și umplutura este aurie.',
          'Serviți calde, decorate cu pătrunjel proaspăt.'
        ],
        imageUrl: '/public/images/demo/ciuperci-umplute.jpg',
        isFeatured: false,
        recommendedForDays: ['monday', 'wednesday', 'friday', 'saturday', 'sunday'],
        occasionTags: ['postul_pastelui', 'postul_craciunului']
      },
      {
        title: 'Chiftele de post din cartofi și ciuperci',
        description: 'Chiftele delicioase și sățioase, perfecte pentru masa de prânz sau cină în zilele de post. Sunt gustoase atât calde, cât și reci.',
        recipeType: 'cu_dezlegare_la_ulei',
        category: 'feluri_principale',
        difficulty: 'mediu',
        preparationMinutes: 30,
        cookingMinutes: 20,
        preparationTime: '30_60_minute',
        servings: 6,
        calories: 210,
        ingredients: [
          '500g cartofi',
          '300g ciuperci champignon',
          '1 ceapă mare',
          '3 căței de usturoi',
          '100g pesmet',
          '3 linguri făină',
          '1 legătură de pătrunjel',
          'sare și piper după gust',
          'boia dulce',
          'ulei pentru prăjit'
        ],
        steps: [
          'Fierbeți cartofii în coajă până când sunt moi. Lăsați-i să se răcească, apoi curățați-i și pasați-i.',
          'Curățați și tocați fin ciupercile, ceapa și usturoiul.',
          'Încălziți puțin ulei într-o tigaie și căliți ceapa până devine translucidă.',
          'Adăugați ciupercile și usturoiul și căliti până când ciupercile își lasă apa și aceasta se evaporă.',
          'Într-un castron mare, combinați cartofii pasați cu amestecul de ciuperci.',
          'Adăugați pătrunjelul tocat, făina, jumătate din cantitatea de pesmet, sare, piper și boia după gust.',
          'Amestecați bine până obțineți o compoziție omogenă și modelați chiftelele cu mâinile ușor umezite.',
          'Treceți chiftelele prin restul de pesmet și presați-le ușor pentru a se lipi.',
          'Încălziți uleiul într-o tigaie și prăjiți chiftelele pe ambele părți până devin aurii și crocante.',
          'Scoateți chiftelele pe un șervețel absorbant pentru a elimina excesul de ulei.',
          'Serviți calde sau reci, cu salată de varză sau murături.'
        ],
        imageUrl: '/public/images/demo/chiftele-post.jpg',
        isFeatured: false,
        recommendedForDays: ['monday', 'wednesday', 'friday'],
        occasionTags: ['postul_pastelui', 'postul_craciunului']
      }
    ];

    // Inserăm rețetele în baza de date
    for (const recipe of demoRecipes) {
      const slug = generateSlug(recipe.title);
      try {
        // Serializăm array-urile ca JSON și apoi le convertim în array PostgreSQL
        const ingredientsJson = JSON.stringify(recipe.ingredients);
        const stepsJson = JSON.stringify(recipe.steps);
        const occasionTagsJson = recipe.occasionTags ? JSON.stringify(recipe.occasionTags) : null;
        const recommendedDaysJson = recipe.recommendedForDays ? JSON.stringify(recipe.recommendedForDays) : null;
        
        await db.execute(
          sql`INSERT INTO fasting_recipes (
            title, slug, description, recipe_type, category, difficulty, 
            preparation_time, ingredients, steps, image_url, calories, 
            servings, preparation_minutes, cooking_minutes, is_featured, 
            source, created_by, monastery_id, occasion_tags, 
            feast_day, recommended_for_days
          ) VALUES (
            ${recipe.title}, ${slug}, ${recipe.description}, ${recipe.recipeType}, 
            ${recipe.category}, ${recipe.difficulty}, ${recipe.preparationTime || '30_60_minute'}, 
            ${ingredientsJson}::text[], ${stepsJson}::text[], 
            ${recipe.imageUrl || null}, ${recipe.calories || null}, 
            ${recipe.servings}, ${recipe.preparationMinutes}, ${recipe.cookingMinutes}, 
            ${recipe.isFeatured || false}, ${recipe.source || null}, 
            ${1}, ${recipe.monasteryId || null}, 
            ${occasionTagsJson}::text[], 
            ${recipe.feastDay || null}, 
            ${recommendedDaysJson}::text[]
          )`
        );
        console.log(`✅ Rețeta "${recipe.title}" a fost adăugată cu succes.`);
      } catch (error) {
        console.error(`❌ Eroare la adăugarea rețetei "${recipe.title}":`, error);
      }
    }

    console.log(`✅ Am adăugat ${demoRecipes.length} rețete de post demonstrative în baza de date.`);
  } catch (error) {
    console.error('❌ Eroare la inițializarea rețetelor de post:', error);
  }
}

// Executăm funcția
initFastingRecipes()
  .then(() => console.log('Script finalizat.'))
  .catch(console.error)
  .finally(() => process.exit(0));