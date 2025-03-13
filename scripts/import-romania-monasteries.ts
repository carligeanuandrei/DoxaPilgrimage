import { db } from "../server/db";
import { monasteries } from "../shared/schema";
import slugify from "slugify";

/**
 * Generează un slug unic pentru mănăstire
 */
function generateUniqueSlug(name: string) {
  return slugify(name, { lower: true, strict: true, locale: 'ro' });
}

/**
 * Importă mai multe mănăstiri din România în baza de date
 */
async function importRomanianMonasteries() {
  try {
    console.log("Începe importul mănăstirilor din România...");

    const monasteryList = [
      // Moldova
      {
        name: "Mănăstirea Neamț",
        description: "Mănăstirea Neamț este una dintre cele mai vechi și mai importante mănăstiri din Moldova, cu o tradiție culturală și spirituală de peste șase secole. A fost un centru important de cultură medievală românească, cu o renumită școală de caligrafi și miniaturiști.",
        shortDescription: "Cea mai importantă mănăstire din Moldova, centru cultural și spiritual cu tradiție de peste șase secole.",
        address: "Comuna Vânători-Neamț, Județul Neamț",
        region: "moldova",
        city: "Vânători-Neamț",
        county: "Neamț",
        patronSaint: "Înălțarea Domnului",
        foundedYear: 1407,
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Neamt_3.jpg"
      },
      // Bucovina
      {
        name: "Mănăstirea Putna",
        description: "Mănăstirea Putna, numită adesea 'Ierusalimul Neamului Românesc', este una dintre cele mai importante ctitorii ale lui Ștefan cel Mare. Aici se află și mormântul marelui domnitor, fiind considerată un loc simbol pentru spiritualitatea și identitatea națională românească.",
        shortDescription: "Loc de pelerinaj și necropolă domnească, ctitorie a lui Ștefan cel Mare, păstrând mormântul domnitorului.",
        address: "Comuna Putna, Județul Suceava",
        region: "bucovina",
        city: "Putna",
        county: "Suceava",
        patronSaint: "Adormirea Maicii Domnului",
        foundedYear: 1469,
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Putna_16.jpg"
      },
      {
        name: "Mănăstirea Voroneț",
        description: "Mănăstirea Voroneț, supranumită 'Capela Sixtină a Estului' datorită frescelor sale exterioare de un albastru unic (albastrul de Voroneț), este una dintre cele mai valoroase ctitorii ale lui Ștefan cel Mare. Este inclusă în patrimoniul mondial UNESCO.",
        shortDescription: "Faimoasă pentru 'albastrul de Voroneț' și pentru scena Judecății de Apoi de pe peretele vestic, parte din patrimoniul UNESCO.",
        address: "Comuna Gura Humorului, Județul Suceava",
        region: "bucovina",
        city: "Voroneț",
        county: "Suceava",
        patronSaint: "Sfântul Gheorghe",
        foundedYear: 1488,
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Voronet_4.jpg"
      },
      {
        name: "Mănăstirea Moldovița",
        description: "Mănăstirea Moldovița face parte din complexul de mănăstiri pictate din Bucovina, fiind inclusă în patrimoniul UNESCO. Este celebră pentru frescele sale exterioare, în special 'Asediul Constantinopolului' și 'Arborele lui Iesei'.",
        shortDescription: "Monument UNESCO cu faimoasa frescă 'Asediul Constantinopolului' și 'Arborele lui Iesei', pictată în stil bizantin unic.",
        address: "Comuna Vatra Moldoviței, Județul Suceava",
        region: "bucovina",
        city: "Vatra Moldoviței",
        county: "Suceava",
        patronSaint: "Buna Vestire",
        foundedYear: 1532,
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Moldovita_5.jpg"
      },
      {
        name: "Mănăstirea Sucevița",
        description: "Mănăstirea Sucevița, ultima dintre mănăstirile pictate din Bucovina, este remarcabilă pentru culoarea verde predominantă și pentru scena unică Scara Virtuților.",
        shortDescription: "Cea mai bine fortificată dintre mănăstirile bucovinene, cu ziduri puternice și turnuri de apărare.",
        address: "Comuna Sucevița, Județul Suceava",
        region: "bucovina",
        city: "Sucevița",
        county: "Suceava",
        patronSaint: "Învierea Domnului",
        foundedYear: 1584,
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Sucevita_1.jpg"
      },
      // Oltenia
      {
        name: "Mănăstirea Cozia",
        description: "Mănăstirea Cozia, situată pe malul drept al râului Olt, este una dintre cele mai reprezentative ctitorii ale domnitorului Mircea cel Bătrân, păstrând nealterat stilul arhitectonic din secolul al XIV-lea.",
        shortDescription: "Cea mai veche și mai bine conservată ctitorie a lui Mircea cel Bătrân, cu arhitectură bizantină remarcabilă.",
        address: "Orașul Călimănești, Județul Vâlcea",
        region: "oltenia",
        city: "Călimănești",
        county: "Vâlcea",
        patronSaint: "Sfânta Treime",
        foundedYear: 1388,
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Cozia_1.jpg"
      },
      // Transilvania
      {
        name: "Mănăstirea Prislop",
        description: "Mănăstirea Prislop, situată în Țara Hațegului, este un important loc de pelerinaj din Transilvania, păstrând amintirea vieții și operei duhovnicești a Sfântului Ioan de la Prislop și a părintelui Arsenie Boca.",
        shortDescription: "Important loc de pelerinaj din Transilvania legat de personalitatea părintelui Arsenie Boca.",
        address: "Comuna Silvașu de Sus, Județul Hunedoara",
        region: "transilvania",
        city: "Silvașu de Sus",
        county: "Hunedoara",
        patronSaint: "Sfântul Ioan Evanghelistul",
        foundedYear: 1400,
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Prislop_1.jpg"
      },
      // Muntenia
      {
        name: "Mănăstirea Curtea de Argeș",
        description: "Mănăstirea Curtea de Argeș, cunoscută și sub numele de 'Biserica Episcopală', este o capodoperă a arhitecturii religioase românești în stil bizantino-islamic. Cunoscută pentru legendara Meșterul Manole, este și necropolă regală a României.",
        shortDescription: "Necropolă a regilor României, faimoasă pentru legendara Meșterul Manole și arhitectura sa unică.",
        address: "Strada Basarabilor, Orașul Curtea de Argeș, Județul Argeș",
        region: "muntenia",
        city: "Curtea de Argeș",
        county: "Argeș",
        patronSaint: "Adormirea Maicii Domnului",
        foundedYear: 1515,
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Curtea_de_Arges_1.jpg"
      },
      // Moldova
      {
        name: "Mănăstirea Sihăstria",
        description: "Mănăstirea Sihăstria este unul dintre cele mai importante centre de spiritualitate ortodoxă din Moldova, având o tradiție isihastă puternică și fiind locul de viețuire al unor mari duhovnici români precum Părintele Cleopa Ilie și Părintele Paisie Olaru.",
        shortDescription: "Centru de spiritualitate ortodoxă din Moldova, locul de nevoință al Părintelui Cleopa și al altor mari duhovnici români.",
        address: "Comuna Vânători-Neamț, Județul Neamț",
        region: "moldova",
        city: "Vânători-Neamț",
        county: "Neamț",
        patronSaint: "Nașterea Maicii Domnului",
        foundedYear: 1655,
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Sihastria_1.jpg"
      },
      // Maramureș
      {
        name: "Mănăstirea Rohia",
        description: "Mănăstirea Rohia, cunoscută și ca 'Mănăstirea Sfânta Ana', este un important centru spiritual și cultural din Transilvania, cunoscut pentru bogata sa bibliotecă și pentru legătura cu scriitorul Nicolae Steinhardt, autorul 'Jurnalului Fericirii'.",
        shortDescription: "Centru spiritual și cultural din Maramureș, legat de scriitorul Nicolae Steinhardt, autorul 'Jurnalului Fericirii'.",
        address: "Comuna Târgu Lăpuș, Județul Maramureș",
        region: "maramures",
        city: "Rohia",
        county: "Maramureș",
        patronSaint: "Sfânta Ana",
        foundedYear: 1923,
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Rohia_1.jpg"
      },
      // Transilvania
      {
        name: "Mănăstirea Nicula",
        description: "Mănăstirea Nicula este un important centru de pelerinaj din Transilvania, fiind cunoscută pentru icoana făcătoare de minuni a Maicii Domnului și pentru tradiționalul pelerinaj de Sfânta Maria Mare. Este și un centru pentru producerea de icoane pe sticlă.",
        shortDescription: "Important centru de pelerinaj din Transilvania cu icoana făcătoare de minuni a Maicii Domnului și școală de icoane pe sticlă.",
        address: "Localitatea Nicula, Comuna Fizeșu Gherlii, Județul Cluj",
        region: "transilvania",
        city: "Fizeșu Gherlii",
        county: "Cluj",
        patronSaint: "Adormirea Maicii Domnului",
        foundedYear: 1552,
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Nicula_1.jpg"
      },
      // Oltenia
      {
        name: "Mănăstirea Horezu",
        description: "Mănăstirea Horezu, ctitorie a domnitorului Constantin Brâncoveanu, este unul dintre cele mai valoroase monumente de artă brâncovenească, remarcabilă pentru sculpturile în piatră și lemn, precum și pentru frescele sale. Este inclusă în patrimoniul UNESCO.",
        shortDescription: "Capodoperă de artă brâncovenească, inclusă în patrimoniul UNESCO, remarcabilă pentru sculpturile și frescele sale.",
        address: "Orașul Horezu, Județul Vâlcea",
        region: "oltenia",
        city: "Horezu",
        county: "Vâlcea",
        patronSaint: "Sfinții Împărați Constantin și Elena",
        foundedYear: 1690,
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Horezu_1.jpg"
      },
      // Moldova
      {
        name: "Mănăstirea Secu",
        description: "Mănăstirea Secu, situată într-o poiană înconjurată de pădure, este o importantă ctitorie din Moldova secolului al XVII-lea, fiind cunoscută pentru manuscrisele și cărțile vechi păstrate în bibliotecă, precum și pentru legătura cu Sfântul Mitropolit Varlaam.",
        shortDescription: "Ctitorie a vornicului Nestor Ureche (tatăl cronicarului Grigore Ureche), cu importante manuscrise și cărți vechi.",
        address: "Comuna Vânători-Neamț, Județul Neamț",
        region: "moldova",
        city: "Vânători-Neamț",
        county: "Neamț",
        patronSaint: "Tăierea Capului Sfântului Ioan Botezătorul",
        foundedYear: 1602,
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Secu_1.jpg"
      },
      // Transilvania
      {
        name: "Mănăstirea Sâmbăta de Sus",
        description: "Mănăstirea Sâmbăta de Sus, cunoscută și ca 'Mănăstirea Brâncoveanu', este un important centru spiritual și cultural din sudul Transilvaniei, cu o bogată tradiție legată de Sfântul Arsenie Boca și de mitropolitul Nicolae Bălan.",
        shortDescription: "Important centru spiritual și cultural din Transilvania, legat de personalitatea Sfântului Arsenie Boca.",
        address: "Comuna Sâmbăta de Sus, Județul Brașov",
        region: "transilvania",
        city: "Sâmbăta de Sus",
        county: "Brașov",
        patronSaint: "Adormirea Maicii Domnului",
        foundedYear: 1696,
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Sambata_de_Sus_1.jpg"
      },
      // Oltenia
      {
        name: "Mănăstirea Polovragi",
        description: "Mănăstirea Polovragi, situată la poalele Munților Căpățâna, este o importantă ctitorie din Oltenia, remarcabilă pentru arhitectura sa în stil brâncovenesc și pentru legătura sa cu legendele despre Zamolxe și peștera din apropiere.",
        shortDescription: "Ctitorie în stil brâncovenesc, situată într-un cadru natural spectaculos, asociată cu legende dacice.",
        address: "Comuna Polovragi, Județul Gorj",
        region: "oltenia",
        city: "Polovragi",
        county: "Gorj",
        patronSaint: "Adormirea Maicii Domnului",
        foundedYear: 1505,
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Polovragi_1.jpg"
      },
      // Bucovina
      {
        name: "Mănăstirea Humorului",
        description: "Mănăstirea Humorului, una dintre mănăstirile pictate din Bucovina, este remarcabilă pentru frescele sale exterioare bine conservate, cu predominanța culorii roșu-brun. Este inclusă în patrimoniul UNESCO.",
        shortDescription: "Mănăstire pictată din Bucovina, inclusă în patrimoniul UNESCO, cu fresce exterioare bine conservate în nuanțe de roșu-brun.",
        address: "Comuna Mănăstirea Humorului, Județul Suceava",
        region: "bucovina",
        city: "Mănăstirea Humorului",
        county: "Suceava",
        patronSaint: "Adormirea Maicii Domnului",
        foundedYear: 1530,
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Humorului_1.jpg"
      },
      // Oltenia
      {
        name: "Mănăstirea Tismana",
        description: "Mănăstirea Tismana, cea mai veche mănăstire din Țara Românească, este situată într-un cadru natural spectaculos și are o istorie bogată legată de Sfântul Nicodim cel Sfințit. Este un important centru spiritual și cultural din Oltenia.",
        shortDescription: "Cea mai veche mănăstire din Țara Românească, ctitorită de Sfântul Nicodim, situată într-un cadru natural spectaculos.",
        address: "Orașul Tismana, Județul Gorj",
        region: "oltenia",
        city: "Tismana",
        county: "Gorj",
        patronSaint: "Adormirea Maicii Domnului",
        foundedYear: 1377,
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Tismana_1.jpg"
      },
      // Muntenia
      {
        name: "Mănăstirea Cernica",
        description: "Mănăstirea Cernica, situată pe o insulă din apropierea Bucureștiului, este una dintre cele mai importante mănăstiri din Muntenia, fiind legată de personalitatea Sfântului Calinic de la Cernica și a altor importanți duhovnici români.",
        shortDescription: "Importantă mănăstire de lângă București, legată de Sfântul Calinic și alți mari duhovnici români.",
        address: "Comuna Cernica, Județul Ilfov",
        region: "muntenia",
        city: "Cernica",
        county: "Ilfov",
        patronSaint: "Sfântul Nicolae",
        foundedYear: 1608,
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Cernica_1.jpg"
      },
      // Moldova
      {
        name: "Mănăstirea Văratec",
        description: "Mănăstirea Văratec este cea mai mare mănăstire de maici din România și una dintre cele mai importante din Moldova, având o bogată tradiție culturală și spirituală. Este legată de personalitatea starețelor Olimpiada Alcaz și Veronica Micle.",
        shortDescription: "Cea mai mare mănăstire de maici din România, cu o bogată tradiție culturală și spirituală legată de starețele Olimpiada și Veronica Micle.",
        address: "Comuna Agapia, Județul Neamț",
        region: "moldova",
        city: "Agapia",
        county: "Neamț",
        patronSaint: "Adormirea Maicii Domnului",
        foundedYear: 1785,
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Varatec_1.jpg"
      }
    ];

    // Inserăm mănăstirile în baza de date
    for (const monastery of monasteryList) {
      // Generăm un slug unic pentru fiecare mănăstire
      const slug = generateUniqueSlug(monastery.name);
      const currentDate = new Date();
      
      await db.insert(monasteries).values({
        name: monastery.name,
        slug: slug,
        description: monastery.description,
        shortDescription: monastery.shortDescription,
        address: monastery.address,
        region: monastery.region,
        city: monastery.city,
        county: monastery.county,
        access: "Drum accesibil auto și pietonal",
        patronSaint: monastery.patronSaint,
        patronSaintDate: null,
        foundedYear: monastery.foundedYear || null,
        history: null,
        specialFeatures: null,
        relics: [""],
        iconDescriptions: [{ name: "", description: "", image: "" }],
        images: [""],
        coverImage: monastery.coverImage,
        type: monastery.type,
        verification: "verified",
        contactEmail: null,
        contactPhone: null,
        website: null,
        administratorId: null,
        latitude: null,
        longitude: null,
        createdAt: currentDate,
        updatedAt: currentDate
      });
    }

    console.log(`Au fost importate cu succes ${monasteryList.length} mănăstiri în baza de date.`);
    return monasteryList.length;
  } catch (error) {
    console.error('Eroare la importul mănăstirilor:', error);
    throw error;
  }
}

// Executăm funcția de import
importRomanianMonasteries()
  .then(count => {
    console.log(`Import finalizat cu succes! S-au adăugat ${count} mănăstiri.`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Eroare la executarea scriptului:', error);
    process.exit(1);
  });