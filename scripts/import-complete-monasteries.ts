import { db } from "../server/db";
import { monasteries } from "../shared/schema";
import slugify from "slugify";

type MonasteryData = {
  name: string;
  description: string;
  shortDescription: string;
  address: string; 
  region: "moldova" | "bucovina" | "muntenia" | "oltenia" | "transilvania" | "maramures" | "banat" | "dobrogea" | "crisana";
  city: string;
  county: string;
  access?: string;
  patronSaint: string;
  patronSaintDate?: string; // Format: YYYY-MM-DD
  foundedYear?: number;
  history?: string;
  specialFeatures?: string;
  relics?: string[];
  type: "monastery" | "hermitage" | "church";
  images?: string[];
  coverImage: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
};

function generateUniqueSlug(name: string) {
  // Generăm un slug simplu din nume
  return slugify(name, { lower: true, strict: true, locale: 'ro' });
}

async function importCompleteMonasteries() {
  try {
    console.log("Începe importul mănăstirilor complete...");

    const monasteryList: MonasteryData[] = [
      // Moldova
      {
        name: "Mănăstirea Neamț",
        description: "Mănăstirea Neamț este una dintre cele mai vechi și mai importante mănăstiri din Moldova, cu o tradiție culturală și spirituală de peste șase secole. A fost un centru important de cultură medievală românească, cu o renumită școală de caligrafi și miniaturiști.",
        shortDescription: "Cea mai importantă mănăstire din Moldova, centru cultural și spiritual cu tradiție de peste șase secole.",
        address: "Comuna Vânători-Neamț, Județul Neamț",
        region: "moldova",
        city: "Vânători-Neamț",
        county: "Neamț",
        access: "Drumul național DN15B, la aproximativ 12 km de orașul Târgu Neamț",
        patronSaint: "Înălțarea Domnului",
        patronSaintDate: "2025-06-12", // Data orientativă pentru 2025
        foundedYear: 1407,
        history: "Mănăstirea Neamț a fost ctitorită de domnitorul Petru I Mușat la sfârșitul secolului al XIV-lea, fiind reconstruită de Ștefan cel Mare în sec. XV. A fost un important centru cultural unde s-au tradus și copiat numeroase manuscrise.",
        specialFeatures: "Muzeul mănăstirii adăpostește o colecție importantă de manuscrise vechi, icoane și obiecte liturgice. Turnul clopotniță construit de Ștefan cel Mare are 30 de metri înălțime.",
        relics: ["Moaștele Sfântului Paisie de la Neamț", "Părticele din moaștele Sfântului Gheorghe"],
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Neamt_3.jpg",
        contactPhone: "0233251580",
        website: "https://manastireaneamt.ro/",
        latitude: 47.2613,
        longitude: 26.1954
      },
      {
        name: "Mănăstirea Putna",
        description: "Mănăstirea Putna, numită adesea 'Ierusalimul Neamului Românesc', este una dintre cele mai importante ctitorii ale lui Ștefan cel Mare. Aici se află și mormântul marelui domnitor, fiind considerată un loc simbol pentru spiritualitatea și identitatea națională românească.",
        shortDescription: "Loc de pelerinaj și necropolă domnească, ctitorie a lui Ștefan cel Mare, păstrând mormântul domnitorului.",
        address: "Comuna Putna, Județul Suceava",
        region: "bucovina",
        city: "Putna",
        county: "Suceava",
        access: "Drumul național DN2H, la aproximativ 30 km de orașul Rădăuți",
        patronSaint: "Adormirea Maicii Domnului",
        patronSaintDate: "2025-08-15", // Data fixă a sărbătorii
        foundedYear: 1469,
        history: "Mănăstirea a fost ctitorită de Ștefan cel Mare între 1466-1469 ca necropolă domnească. A fost restaurată de mai multe ori, ultima renovare majoră fiind făcută în perioada 1654-1662 de către domnitorul Gheorghe Ștefan.",
        specialFeatures: "Muzeul mănăstirii conține obiecte de artă bisericească, broderii, manuscrise, cărți vechi. Turnul tezaur adăpostește obiecte prețioase donate de Ștefan cel Mare și alte personalități istorice.",
        relics: ["Părticele din moaștele Sfântului Ghenadie de la Putna", "Epitaful Sfintei Ana de Putna (broderie din sec. XV)"],
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Putna_16.jpg",
        contactPhone: "0230414055",
        website: "https://www.putna.ro/",
        latitude: 47.8767,
        longitude: 25.5844
      },
      {
        name: "Mănăstirea Voroneț",
        description: "Mănăstirea Voroneț, supranumită 'Capela Sixtină a Estului' datorită frescelor sale exterioare de un albastru unic (albastrul de Voroneț), este una dintre cele mai valoroase ctitorii ale lui Ștefan cel Mare. Este inclusă în patrimoniul mondial UNESCO.",
        shortDescription: "Faimoasă pentru 'albastrul de Voroneț' și pentru scena Judecății de Apoi de pe peretele vestic, parte din patrimoniul UNESCO.",
        address: "Comuna Gura Humorului, Județul Suceava",
        region: "bucovina",
        city: "Voroneț",
        county: "Suceava",
        access: "Drumul național DN17, la aproximativ 5 km de orașul Gura Humorului",
        patronSaint: "Sfântul Gheorghe",
        patronSaintDate: "2025-04-23", // Data fixă a sărbătorii
        foundedYear: 1488,
        history: "Construită în doar trei luni și trei săptămâni în anul 1488 din porunca lui Ștefan cel Mare, ca urmare a unei victorii împotriva turcilor. Picturile exterioare au fost adăugate în timpul domniei lui Petru Rareș.",
        specialFeatures: "Biserica mănăstirii este celebră pentru culoarea albastră a frescelor exterioare (albastrul de Voroneț) și pentru scena Judecății de Apoi de pe peretele vestic.",
        relics: ["Moaștele Sfântului Daniil Sihastrul"],
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Voronet_4.jpg",
        contactPhone: "0230234912",
        website: "https://www.voronet.ro/",
        latitude: 47.5175,
        longitude: 25.8639
      },
      {
        name: "Mănăstirea Moldovița",
        description: "Mănăstirea Moldovița face parte din complexul de mănăstiri pictate din Bucovina, fiind inclusă în patrimoniul UNESCO. Este celebră pentru frescele sale exterioare, în special 'Asediul Constantinopolului' și 'Arborele lui Iesei'.",
        shortDescription: "Monument UNESCO cu faimoasa frescă 'Asediul Constantinopolului' și 'Arborele lui Iesei', pictată în stil bizantin unic.",
        address: "Comuna Vatra Moldoviței, Județul Suceava",
        region: "bucovina",
        city: "Vatra Moldoviței",
        county: "Suceava",
        access: "Drumul național DN17A, la aproximativ 18 km de orașul Câmpulung Moldovenesc",
        patronSaint: "Buna Vestire",
        patronSaintDate: "2025-03-25", // Data fixă a sărbătorii
        foundedYear: 1532,
        history: "Ctitorită de Petru Rareș în anul 1532 pe locul unei vechi mănăstiri din lemn din secolul al XIV-lea care fusese distrusă de alunecări de teren. Picturile murale exterioare au fost realizate în 1537 de zugravul Toma din Suceava.",
        specialFeatures: "Fresca 'Asediul Constantinopolului' de pe zidul sudic este una dintre cele mai valoroase reprezentări ale acestui subiect în arta medievală. Culoarea predominantă este galbenul ocru.",
        relics: ["Părticele din moaștele Sfinților Mucenici din Brâncoveni"],
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Moldovita_5.jpg",
        contactPhone: "0230336380",
        website: "https://www.manastireamoldovita.ro/",
        latitude: 47.6503,
        longitude: 25.5377
      },
      {
        name: "Mănăstirea Sucevița",
        description: "Mănăstirea Sucevița, ultima dintre mănăstirile pictate din Bucovina, este remarcabilă pentru culoarea verde predominantă și pentru scena unică „Scara Virtuților".",
        shortDescription: "Cea mai bine fortificată dintre mănăstirile bucovinene, cu ziduri puternice și turnuri de apărare.",
        address: "Comuna Sucevița, Județul Suceava",
        region: "bucovina",
        city: "Sucevița",
        county: "Suceava",
        access: "Drumul național DN17A, la aproximativ 35 km de orașul Rădăuți",
        patronSaint: "Învierea Domnului",
        patronSaintDate: "2025-04-20", // Data orientativă pentru 2025
        foundedYear: 1584,
        history: "Ctitorită între 1582-1584 de către familia Movilă, fiind ultima și cea mai mare dintre mănăstirile medievale pictate din Bucovina. Ansamblul monastic este înconjurat de ziduri înalte cu turnuri de apărare.",
        specialFeatures: "Biserica mănăstirii are picturile exterioare foarte bine conservate, cu o nuanță predominant verde. Scena 'Scara Virtuților' de pe peretele nordic este unică în arta religioasă ortodoxă.",
        relics: ["Moaștele Sfântului Ioan cel Nou de la Suceava (fragmente)"],
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Sucevita_1.jpg",
        contactPhone: "0230417364",
        website: "https://www.manastireasucevita.ro/",
        latitude: 47.7778,
        longitude: 25.7108
      },
      {
        name: "Mănăstirea Cozia",
        description: "Mănăstirea Cozia, situată pe malul drept al râului Olt, este una dintre cele mai reprezentative ctitorii ale domnitorului Mircea cel Bătrân, păstrând nealterat stilul arhitectonic din secolul al XIV-lea.",
        shortDescription: "Cea mai veche și mai bine conservată ctitorie a lui Mircea cel Bătrân, cu arhitectură bizantină remarcabilă.",
        address: "Orașul Călimănești, Județul Vâlcea",
        region: "oltenia",
        city: "Călimănești",
        county: "Vâlcea",
        access: "Drumul național DN7 (E81), la aproximativ 25 km nord de Râmnicu Vâlcea",
        patronSaint: "Sfânta Treime",
        patronSaintDate: "2025-06-01", // Data orientativă pentru 2025
        foundedYear: 1388,
        history: "Ctitorită între 1387-1388 de către domnitorul Mircea cel Bătrân. Aici se află mormântul acestuia. Mănăstirea a fost un important centru cultural în Evul Mediu, unde a fost tradus primul cod de legi din Țara Românească.",
        specialFeatures: "Biserica mănăstirii păstrează picturile originale în stil bizantin din secolul al XIV-lea. Complexul monastic include și ruinele unui spital din secolul al XVIII-lea.",
        relics: ["Fragmente din moaștele Sfântului Grigorie Decapolitul"],
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Cozia_1.jpg",
        contactPhone: "0250750318",
        website: "https://www.manastireacozia.ro/",
        latitude: 45.3172,
        longitude: 24.3308
      },
      {
        name: "Mănăstirea Prislop",
        description: "Mănăstirea Prislop, situată în Țara Hațegului, este un important loc de pelerinaj din Transilvania, păstrând amintirea vieții și operei duhovnicești a Sfântului Ioan de la Prislop și a părintelui Arsenie Boca.",
        shortDescription: "Important loc de pelerinaj din Transilvania legat de personalitatea părintelui Arsenie Boca.",
        address: "Comuna Silvașu de Sus, Județul Hunedoara",
        region: "transilvania",
        city: "Silvașu de Sus",
        county: "Hunedoara",
        access: "Drumul județean DJ668, la aproximativ 13 km de orașul Hațeg",
        patronSaint: "Sfântul Ioan Evanghelistul",
        patronSaintDate: "2025-05-08", // Data fixă pentru sărbătorirea Sf. Ioan Evanghelistul
        foundedYear: 1400,
        history: "Mănăstirea datează din secolul al XIV-lea, fiind înființată de călugărul Nicodim cel Sfințit. A fost loc de viețuire pentru Sfântul Ioan de la Prislop în secolul al XVI-lea și mai târziu pentru părintele Arsenie Boca în perioada 1948-1959.",
        specialFeatures: "Mănăstirea este strâns legată de personalitatea Sfântului Arsenie Boca, care a pictat biserica mănăstirii. Aici se află mormântul prințesei Ileana a României, devenită mai târziu maica Alexandra.",
        relics: ["Fragmente din moaștele Sfântului Ioan de la Prislop"],
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Prislop_1.jpg",
        contactPhone: "0254777824",
        website: "https://www.manastireaprislopului.ro/",
        latitude: 45.5875,
        longitude: 22.8994
      },
      {
        name: "Mănăstirea Curtea de Argeș",
        description: "Mănăstirea Curtea de Argeș, cunoscută și sub numele de 'Biserica Episcopală', este o capodoperă a arhitecturii religioase românești în stil bizantino-islamic. Cunoscută pentru legendara Meșterul Manole, este și necropolă regală a României.",
        shortDescription: "Necropolă a regilor României, faimoasă pentru legendara Meșterul Manole și arhitectura sa unică.",
        address: "Strada Basarabilor, Orașul Curtea de Argeș, Județul Argeș",
        region: "muntenia",
        city: "Curtea de Argeș",
        county: "Argeș",
        access: "Drumul național DN7C, în centrul orașului Curtea de Argeș",
        patronSaint: "Adormirea Maicii Domnului",
        patronSaintDate: "2025-08-15", // Data fixă a sărbătorii
        foundedYear: 1515,
        history: "Ctitorită între 1515-1517 de către domnitorul Neagoe Basarab. Legendele spun că meșterul Manole și-ar fi zidit soția în zidurile bisericii pentru ca aceasta să nu se mai prăbușească. Din 1914 este necropolă regală a României.",
        specialFeatures: "Biserica are o arhitectură unică, cu influențe bizantine și islamice. Decorațiunile exterioare sunt bogat ornamentate, cu două turle răsucite. În interiorul mănăstirii se află mormintele regilor și reginelor României.",
        relics: ["Moaștele Sfintei Mucenițe Filofteia"],
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Curtea_de_Arges_1.jpg",
        contactPhone: "0248721475",
        website: "https://www.manastireacurteadearges.ro/",
        latitude: 45.1447,
        longitude: 24.6667
      },
      {
        name: "Mănăstirea Sihăstria",
        description: "Mănăstirea Sihăstria este unul dintre cele mai importante centre de spiritualitate ortodoxă din Moldova, având o tradiție isihastă puternică și fiind locul de viețuire al unor mari duhovnici români precum Părintele Cleopa Ilie și Părintele Paisie Olaru.",
        shortDescription: "Centru de spiritualitate ortodoxă din Moldova, locul de nevoință al Părintelui Cleopa și al altor mari duhovnici români.",
        address: "Comuna Vânători-Neamț, Județul Neamț",
        region: "moldova",
        city: "Vânători-Neamț",
        county: "Neamț",
        access: "Drumul național DN15B, la aproximativ 22 km de orașul Târgu Neamț",
        patronSaint: "Nașterea Maicii Domnului",
        patronSaintDate: "2025-09-08", // Data fixă a sărbătorii
        foundedYear: 1655,
        history: "Înființată în secolul al XVII-lea ca un schit mic, mănăstirea a devenit un important centru monahal în secolul XX, când aici s-au nevoit mari duhovnici români precum Părintele Cleopa Ilie și Părintele Paisie Olaru.",
        specialFeatures: "Muzeul mănăstirii cuprinde obiecte personale ale Părintelui Cleopa, manuscrise și cărți vechi. Mănăstirea este înconjurată de pădure, oferind un cadru natural propice vieții contemplative.",
        relics: ["Moaștele Sfântului Teodosie de la Sihăstria", "Părticele din moaștele Sfântului Paisie de la Neamț"],
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Sihastria_1.jpg",
        contactPhone: "0233251580",
        website: "https://www.manastireasihastria.ro/",
        latitude: 47.2128,
        longitude: 26.2503
      },
      {
        name: "Mănăstirea Rohia",
        description: "Mănăstirea Rohia, cunoscută și ca 'Mănăstirea Sfânta Ana', este un important centru spiritual și cultural din Transilvania, cunoscut pentru bogata sa bibliotecă și pentru legătura cu scriitorul Nicolae Steinhardt, autorul 'Jurnalului Fericirii'.",
        shortDescription: "Centru spiritual și cultural din Maramureș, legat de scriitorul Nicolae Steinhardt, autorul 'Jurnalului Fericirii'.",
        address: "Comuna Târgu Lăpuș, Județul Maramureș",
        region: "maramures",
        city: "Rohia",
        county: "Maramureș",
        access: "Drumul județean DJ109F, la aproximativ 30 km de orașul Baia Mare",
        patronSaint: "Sfânta Ana",
        patronSaintDate: "2025-07-25", // Data fixă a sărbătorii
        foundedYear: 1923,
        history: "Înființată în 1923 de către preotul Nicolae Gherman din Rohia, mănăstirea a devenit celebră după ce scriitorul evreu convertit la ortodoxie, Nicolae Steinhardt, a viețuit aici ca monah între 1980-1989.",
        specialFeatures: "Biblioteca mănăstirii, numită 'Nicolae Steinhardt', conține peste 40.000 de volume, inclusiv manuscrise și cărți rare. La mănăstire se află și un muzeu dedicat lui Nicolae Steinhardt.",
        relics: ["Părticele din moaștele Sfinților Martiri Brâncoveni"],
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Rohia_1.jpg",
        contactPhone: "0262384114",
        website: "https://www.manastirearohia.ro/",
        latitude: 47.4825,
        longitude: 23.7506
      },
      {
        name: "Mănăstirea Nicula",
        description: "Mănăstirea Nicula este un important centru de pelerinaj din Transilvania, fiind cunoscută pentru icoana făcătoare de minuni a Maicii Domnului și pentru tradiționalul pelerinaj de Sfânta Maria Mare. Este și un centru pentru producerea de icoane pe sticlă.",
        shortDescription: "Important centru de pelerinaj din Transilvania cu icoana făcătoare de minuni a Maicii Domnului și școală de icoane pe sticlă.",
        address: "Localitatea Nicula, Comuna Fizeșu Gherlii, Județul Cluj",
        region: "transilvania",
        city: "Fizeșu Gherlii",
        county: "Cluj",
        access: "Drumul județean DJ109D, la aproximativ 12 km de orașul Gherla",
        patronSaint: "Adormirea Maicii Domnului",
        patronSaintDate: "2025-08-15", // Data fixă a sărbătorii
        foundedYear: 1552,
        history: "Prima atestare documentară datează din 1552, dar mănăstirea a devenit celebră în 1699 când icoana Maicii Domnului a lăcrimat timp de 26 de zile, eveniment care a transformat-o într-un important loc de pelerinaj.",
        specialFeatures: "Mănăstirea este centrul unde s-a dezvoltat tradiția pictării icoanelor pe sticlă din Transilvania. Icoana făcătoare de minuni a Maicii Domnului datează din 1681 și a fost pictată de preotul Luca din Iclod.",
        relics: ["Icoana făcătoare de minuni a Maicii Domnului", "Părticele din moaștele Sfântului Gheorghe"],
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Nicula_1.jpg",
        contactPhone: "0264241280",
        website: "https://www.manastireanicula.ro/",
        latitude: 47.1300,
        longitude: 23.9867
      },
      {
        name: "Mănăstirea Horezu",
        description: "Mănăstirea Horezu, ctitorie a domnitorului Constantin Brâncoveanu, este unul dintre cele mai valoroase monumente de artă brâncovenească, remarcabilă pentru sculpturile în piatră și lemn, precum și pentru frescele sale. Este inclusă în patrimoniul UNESCO.",
        shortDescription: "Capodoperă de artă brâncovenească, inclusă în patrimoniul UNESCO, remarcabilă pentru sculpturile și frescele sale.",
        address: "Orașul Horezu, Județul Vâlcea",
        region: "oltenia",
        city: "Horezu",
        county: "Vâlcea",
        access: "Drumul național DN67, la marginea orașului Horezu",
        patronSaint: "Sfinții Împărați Constantin și Elena",
        patronSaintDate: "2025-05-21", // Data fixă a sărbătorii
        foundedYear: 1690,
        history: "Ctitorită între 1690-1693 de către domnitorul Constantin Brâncoveanu, mănăstirea reprezintă cea mai importantă creație arhitectonică în stilul brâncovenesc. A fost și un important centru cultural, aici funcționând o școală de caligrafi și miniaturiști.",
        specialFeatures: "Biserica principală are un pridvor cu coloane sculptate și un brâu median decorativ sculptat în piatră. Catapeteasma bisericii este una dintre cele mai valoroase opere de artă sculptată în lemn din Țara Românească.",
        relics: ["Părticele din moaștele Sfinților Martiri Brâncoveni"],
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Horezu_1.jpg",
        contactPhone: "0250860071",
        website: "https://www.manastireahorezu.ro/",
        latitude: 45.1683,
        longitude: 23.9983
      },
      {
        name: "Mănăstirea Secu",
        description: "Mănăstirea Secu, situată într-o poiană înconjurată de pădure, este o importantă ctitorie din Moldova secolului al XVII-lea, fiind cunoscută pentru manuscrisele și cărțile vechi păstrate în bibliotecă, precum și pentru legătura cu Sfântul Mitropolit Varlaam.",
        shortDescription: "Ctitorie a vornicului Nestor Ureche (tatăl cronicarului Grigore Ureche), cu importante manuscrise și cărți vechi.",
        address: "Comuna Vânători-Neamț, Județul Neamț",
        region: "moldova",
        city: "Vânători-Neamț",
        county: "Neamț",
        access: "Drumul forestier din Vânători-Neamț, la aproximativ L8 km de mănăstirea Neamț",
        patronSaint: "Tăierea Capului Sfântului Ioan Botezătorul",
        patronSaintDate: "2025-08-29", // Data fixă a sărbătorii
        foundedYear: 1602,
        history: "Ctitorită în 1602 de către vornicul Nestor Ureche, tatăl cronicarului Grigore Ureche. Mănăstirea a fost un important centru cultural, aici slujind și Sfântul Mitropolit Varlaam, autorul primei cărți tipărite în limba română în Moldova.",
        specialFeatures: "Biblioteca mănăstirii păstrează manuscrise și cărți vechi de mare valoare. Biserica principală are arhitectură specifică epocii lui Vasile Lupu, cu elemente decorative moldovenești.",
        relics: ["Fragmente din moaștele Sfântului Mare Mucenic Pantelimon"],
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Secu_1.jpg",
        contactPhone: "0233251580",
        website: "https://www.manastireasecu.ro/",
        latitude: 47.2186,
        longitude: 26.1753
      },
      {
        name: "Mănăstirea Sâmbăta de Sus",
        description: "Mănăstirea Sâmbăta de Sus, cunoscută și ca 'Mănăstirea Brâncoveanu', este un important centru spiritual și cultural din sudul Transilvaniei, cu o bogată tradiție legată de Sfântul Arsenie Boca și de mitropolitul Nicolae Bălan.",
        shortDescription: "Important centru spiritual și cultural din Transilvania, legat de personalitatea Sfântului Arsenie Boca.",
        address: "Comuna Sâmbăta de Sus, Județul Brașov",
        region: "transilvania",
        city: "Sâmbăta de Sus",
        county: "Brașov",
        access: "Drumul județean DJ106B, la aproximativ 26 km de orașul Făgăraș",
        patronSaint: "Adormirea Maicii Domnului",
        patronSaintDate: "2025-08-15", // Data fixă a sărbătorii
        foundedYear: 1696,
        history: "Ctitorită în 1696 de către Constantin Brâncoveanu, mănăstirea a fost distrusă parțial în 1785 de către generalul austriac Preiss. A fost reconstruită între 1926-1936 la inițiativa mitropolitului Nicolae Bălan, devenind un important centru cultural și spiritual.",
        specialFeatures: "Mănăstirea este situată la poalele Munților Făgăraș într-un cadru natural spectaculos. Aici a slujit o perioadă Părintele Arsenie Boca, iar în apropiere se află un izvor considerat făcător de minuni.",
        relics: ["Fragmente din moaștele Sfinților Martiri Brâncoveni"],
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Sambata_de_Sus_1.jpg",
        contactPhone: "0268360380",
        website: "https://www.manastireasambata.ro/",
        latitude: 45.7231,
        longitude: 24.8039
      },
      {
        name: "Mănăstirea Polovragi",
        description: "Mănăstirea Polovragi, situată la poalele Munților Căpățâna, este o importantă ctitorie din Oltenia, remarcabilă pentru arhitectura sa în stil brâncovenesc și pentru legătura sa cu legendele despre Zamolxe și peștera din apropiere.",
        shortDescription: "Ctitorie în stil brâncovenesc, situată într-un cadru natural spectaculos, asociată cu legende dacice.",
        address: "Comuna Polovragi, Județul Gorj",
        region: "oltenia",
        city: "Polovragi",
        county: "Gorj",
        access: "Drumul național DN67, la aproximativ 40 km de orașul Târgu Jiu",
        patronSaint: "Adormirea Maicii Domnului",
        patronSaintDate: "2025-08-15", // Data fixă a sărbătorii
        foundedYear: 1505,
        history: "Întemeiată la începutul secolului al XVI-lea și reconstruită în stil brâncovenesc între 1703-1713 de către egumenul Lavrentie. Numele 'Polovragi' vine de la cuvântul slav 'polovragi' care înseamnă 'pe mal stâncos'.",
        specialFeatures: "Complexul monastic este situat într-un cadru natural spectaculos, la poalele munților. În apropiere se află Peștera Polovragi, legată de legendele despre Zamolxe și cultul dacic.",
        relics: ["Icoana făcătoare de minuni a Maicii Domnului"],
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Polovragi_1.jpg",
        contactPhone: "0253476558",
        website: "https://www.manastireapolovragi.ro/",
        latitude: 45.1844,
        longitude: 23.8036
      },
      {
        name: "Mănăstirea Humorului",
        description: "Mănăstirea Humorului, una dintre mănăstirile pictate din Bucovina, este remarcabilă pentru frescele sale exterioare bine conservate, cu predominanța culorii roșu-brun. Este inclusă în patrimoniul UNESCO.",
        shortDescription: "Mănăstire pictată din Bucovina, inclusă în patrimoniul UNESCO, cu fresce exterioare bine conservate în nuanțe de roșu-brun.",
        address: "Comuna Mănăstirea Humorului, Județul Suceava",
        region: "bucovina",
        city: "Mănăstirea Humorului",
        county: "Suceava",
        access: "Drumul județean DJ175, la aproximativ 5 km de orașul Gura Humorului",
        patronSaint: "Adormirea Maicii Domnului",
        patronSaintDate: "2025-08-15", // Data fixă a sărbătorii
        foundedYear: 1530,
        history: "Ctitorită în 1530 de către logofătul Teodor Bubuiog și soția sa Elena, în timpul domniei lui Petru Rareș. Picturile murale au fost realizate în 1535 de meșterul Toma din Suceava.",
        specialFeatures: "Frescele exterioare sunt dominate de culoarea roșu-brun (roșu de Humor). Scena 'Imnul Acatist' de pe zidul sudic este una dintre cele mai valoroase reprezentări ale acestui subiect în arta medievală.",
        relics: ["Părticele din moaștele Sfântului Mare Mucenic Gheorghe"],
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Humorului_1.jpg",
        contactPhone: "0230207000",
        website: "https://www.manastireahumorului.ro/",
        latitude: 47.6003,
        longitude: 25.9422
      },
      {
        name: "Mănăstirea Govora",
        description: "Mănăstirea Govora este una dintre cele mai vechi mănăstiri din Țara Românească, cu o bogată istorie culturală. Aici a funcționat prima tipografie din Oltenia și s-a tipărit primul Pravile (cod de legi) din Țara Românească.",
        shortDescription: "Una dintre cele mai vechi mănăstiri din Țara Românească, cu prima tipografie din Oltenia și primul cod de legi.",
        address: "Orașul Băile Govora, Județul Vâlcea",
        region: "oltenia",
        city: "Băile Govora",
        county: "Vâlcea",
        access: "Drumul național DN67, la aproximativ 20 km de orașul Râmnicu Vâlcea",
        patronSaint: "Adormirea Maicii Domnului",
        patronSaintDate: "2025-08-15", // Data fixă a sărbătorii
        foundedYear: 1492,
        history: "Prima atestare documentară datează din timpul domniei lui Vlad Călugărul (1482-1495). Mănăstirea a fost un important centru cultural, aici funcționând prima tipografie din Oltenia, unde s-a tipărit în 1640 primul cod de legi din Țara Românească.",
        specialFeatures: "Biserica principală are o arhitectură specifică epocii lui Matei Basarab, cu influențe bizantine și elemente decorative brâncovenești. Muzeul mănăstirii găzduiește o colecție de cărți vechi și obiecte liturgice.",
        relics: ["Fragmente din moaștele Sfântului Grigorie Decapolitul"],
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Govora_1.jpg",
        contactPhone: "0250770507",
        website: "https://www.manastireagovora.ro/",
        latitude: 45.0833,
        longitude: 24.1833
      },
      {
        name: "Mănăstirea Tismana",
        description: "Mănăstirea Tismana, cea mai veche mănăstire din Țara Românească, este situată într-un cadru natural spectaculos și are o istorie bogată legată de Sfântul Nicodim cel Sfințit. Este un important centru spiritual și cultural din Oltenia.",
        shortDescription: "Cea mai veche mănăstire din Țara Românească, ctitorită de Sfântul Nicodim, situată într-un cadru natural spectaculos.",
        address: "Orașul Tismana, Județul Gorj",
        region: "oltenia",
        city: "Tismana",
        county: "Gorj",
        access: "Drumul național DN67D, la aproximativ 30 km de orașul Târgu Jiu",
        patronSaint: "Adormirea Maicii Domnului",
        patronSaintDate: "2025-08-15", // Data fixă a sărbătorii
        foundedYear: 1377,
        history: "Ctitorită între 1377-1378 de către Sfântul Nicodim cel Sfințit, cu sprijinul domnitorului Radu I. În timpul celui de-al Doilea Război Mondial, aici a fost adăpostit tezaurul României. Mănăstirea a fost un important centru cultural în Evul Mediu.",
        specialFeatures: "Complexul monastic este situat pe o stâncă, lângă o cascadă, într-un cadru natural deosebit. Biserica păstrează fragmente din picturile originale din secolul al XIV-lea, precum și picturi din secolele XVIII-XIX.",
        relics: ["Moaștele Sfântului Nicodim cel Sfințit", "Icoana făcătoare de minuni a Maicii Domnului"],
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Tismana_1.jpg",
        contactPhone: "0253374125",
        website: "https://www.manastireatismana.ro/",
        latitude: 45.0428,
        longitude: 22.8494
      },
      {
        name: "Mănăstirea Hurezi",
        description: "Mănăstirea Hurezi, cunoscută și ca Mănăstirea Horezu, este cea mai importantă ctitorie a domnitorului Constantin Brâncoveanu și cel mai reprezentativ monument de artă brâncovenească. Este inclusă în patrimoniul UNESCO.",
        shortDescription: "Cea mai importantă ctitorie brâncovenească, inclusă în patrimoniul UNESCO, remarcabilă pentru sculptura în piatră și lemn.",
        address: "Orașul Horezu, Județul Vâlcea",
        region: "oltenia",
        city: "Horezu",
        county: "Vâlcea",
        access: "Drumul național DN67, la marginea orașului Horezu",
        patronSaint: "Sfinții Împărați Constantin și Elena",
        patronSaintDate: "2025-05-21", // Data fixă a sărbătorii
        foundedYear: 1690,
        history: "Ctitorită între 1690-1693 de către domnitorul Constantin Brâncoveanu, mănăstirea reprezintă cea mai importantă creație arhitectonică în stilul brâncovenesc, o sinteză între tradițiile locale și influențele orientale și occidentale.",
        specialFeatures: "Complexul monastic include biserica principală, bolnița, paraclisul, schiturile Sfinții Apostoli și Sfântul Ștefan, și chiliile călugărilor. Sculptura în piatră și lemn, precum și picturile murale sunt de o valoare artistică excepțională.",
        relics: ["Părticele din moaștele Sfinților Martiri Brâncoveni"],
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Hurezi_1.jpg",
        contactPhone: "0250860071",
        website: "https://www.manastireahurezi.ro/",
        latitude: 45.1683,
        longitude: 23.9983
      },
      {
        name: "Mănăstirea Bistrița (Vâlcea)",
        description: "Mănăstirea Bistrița din județul Vâlcea este una dintre cele mai importante ctitorii ale boierilor Craioveşti, având o bogată istorie culturală și spirituală. Aici sunt păstrate moaștele Sfântului Grigorie Decapolitul și a funcționat una dintre primele școli din Țara Românească.",
        shortDescription: "Importantă ctitorie a boierilor Craiovești, păstrând moaștele Sfântului Grigorie Decapolitul și având o bogată istorie culturală.",
        address: "Comuna Costești, Județul Vâlcea",
        region: "oltenia",
        city: "Costești",
        county: "Vâlcea",
        access: "Drumul județean DJ646, la aproximativ 25 km de orașul Râmnicu Vâlcea",
        patronSaint: "Adormirea Maicii Domnului",
        patronSaintDate: "2025-08-15", // Data fixă a sărbătorii
        foundedYear: 1494,
        history: "Ctitorită în 1494 de către boierii Craioveşti, mănăstirea a fost un important centru cultural, aici funcționând una dintre primele școli din Țara Românească. Aici s-au refugiat în mai multe rânduri domnitori ai Țării Românești și s-au păstrat documente importante.",
        specialFeatures: "Mănăstirea păstrează moaștele Sfântului Grigorie Decapolitul, aduse aici în 1497. Biserica actuală, construită în 1855, are o arhitectură neoclasică. Muzeul mănăstirii adăpostește o colecție valoroasă de manuscrise, documente istorice și obiecte liturgice.",
        relics: ["Moaștele Sfântului Grigorie Decapolitul"],
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Bistrita_Valcea_1.jpg",
        contactPhone: "0250863532",
        website: "https://www.manastireabistrita.ro/",
        latitude: 45.1167,
        longitude: 24.0500
      },
      {
        name: "Mănăstirea Dintr-un Lemn",
        description: "Mănăstirea Dintr-un Lemn este o veche mănăstire din Oltenia, cunoscută pentru legenda că biserica sa ar fi fost făcută dintr-un singur stejar uriaș și pentru icoana făcătoare de minuni a Maicii Domnului.",
        shortDescription: "Veche mănăstire din Oltenia cu o legendă fascinantă și o icoană făcătoare de minuni a Maicii Domnului.",
        address: "Comuna Frâncești, Județul Vâlcea",
        region: "oltenia",
        city: "Frâncești",
        county: "Vâlcea",
        access: "Drumul județean DJ677A, la aproximativ 15 km de orașul Râmnicu Vâlcea",
        patronSaint: "Nașterea Maicii Domnului",
        patronSaintDate: "2025-09-08", // Data fixă a sărbătorii
        foundedYear: 1635,
        history: "Conform tradiției, mănăstirea datează din secolul al XVI-lea, când un cioban a găsit în scorbura unui stejar o icoană făcătoare de minuni a Maicii Domnului. Prima biserică, conform legendei, ar fi fost făcută dintr-un singur stejar uriaș, de unde și numele mănăstirii.",
        specialFeatures: "Mănăstirea păstrează icoana făcătoare de minuni a Maicii Domnului datând din secolul al XVI-lea. Biserica actuală a fost construită în secolul al XVII-lea în timpul domniei lui Matei Basarab.",
        relics: ["Icoana făcătoare de minuni a Maicii Domnului"],
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Dintr-un_Lemn_1.jpg",
        contactPhone: "0250761561",
        website: "https://www.manastireadintrlemn.ro/",
        latitude: 45.0500,
        longitude: 24.2500
      },
      {
        name: "Mănăstirea Bistrița (Neamț)",
        description: "Mănăstirea Bistrița din județul Neamț este o importantă ctitorie a familiei domnești a Mușatinilor, fiind un important centru cultural în Moldova medievală. Aici a funcționat prima școală de traducători și copiști din Moldova și prima tipografie.",
        shortDescription: "Importantă ctitorie a familiei Mușatinilor, cu prima școală de traducători și copiști și prima tipografie din Moldova medievală.",
        address: "Comuna Alexandru cel Bun, Județul Neamț",
        region: "moldova",
        city: "Alexandru cel Bun",
        county: "Neamț",
        access: "Drumul județean DJ155F, la aproximativ 8 km de orașul Piatra Neamț",
        patronSaint: "Sfântul Ioan Botezătorul",
        patronSaintDate: "2025-01-07", // Data fixă a sărbătorii
        foundedYear: 1407,
        history: "Ctitorită în timpul domniei lui Alexandru cel Bun (1400-1432) de către boierii Ștefan și Alexandru, fiii lui Ștefan Mușat. A fost un important centru cultural în Moldova medievală, aici funcționând prima școală de traducători și copiști din Moldova și prima tipografie, adusă de Petru Rareș.",
        specialFeatures: "Biserica actuală, construită în secolul al XVII-lea în stil moldovenesc, păstrează fragmente din picturile originale. Muzeul mănăstirii adăpostește o colecție valoroasă de manuscrise, cărți vechi și obiecte liturgice.",
        relics: ["Fragmente din moaștele Sfântului Clement Romanul"],
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Bistrita_Neamt_1.jpg",
        contactPhone: "0233244376",
        website: "https://www.manastireabistritaneamt.ro/",
        latitude: 46.9167,
        longitude: 26.3333
      },
      {
        name: "Mănăstirea Ciolanu",
        description: "Mănăstirea Ciolanu, situată în zona dealurilor Buzăului, este una dintre cele mai vechi mănăstiri din Muntenia, cunoscută pentru faptul că a păstrat tradiția vieții monastice neîntrerupt din secolul al XVI-lea până în prezent.",
        shortDescription: "Veche mănăstire din zona Buzăului, cu tradiție monastică neîntreruptă din secolul al XVI-lea până în prezent.",
        address: "Comuna Tisău, Județul Buzău",
        region: "muntenia",
        city: "Tisău",
        county: "Buzău",
        access: "Drumul județean DJ100H, la aproximativ 25 km de orașul Buzău",
        patronSaint: "Sfântul Mare Mucenic Gheorghe",
        patronSaintDate: "2025-04-23", // Data fixă a sărbătorii
        foundedYear: 1590,
        history: "Fondată la sfârșitul secolului al XVI-lea (în jurul anului 1590) de către domnitorul Mihnea Turcitul. A fost refăcută și extinsă în mai multe rânduri, mai ales în timpul domniei lui Matei Basarab și în perioada brâncovenească.",
        specialFeatures: "Complexul monastic include două biserici: biserica mare, cu hramul Sfântul Gheorghe, și biserica veche, cu hramul Sfântul Ilie. Mănăstirea este situată într-un cadru natural pitoresc, fiind înconjurată de păduri și dealuri.",
        relics: ["Fragmente din moaștele Sfântului Gheorghe", "Icoana făcătoare de minuni a Maicii Domnului"],
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Ciolanu_1.jpg",
        contactPhone: "0238588005",
        website: "https://www.manastireaciolanu.ro/",
        latitude: 45.2500,
        longitude: 26.5833
      },
      {
        name: "Mănăstirea Măxineni",
        description: "Mănăstirea Măxineni, situată în câmpia Bărăganului, este o ctitorie a domnitorului Matei Basarab, reconstruită după ce a fost distrusă în timpul regimului comunist. Este un important centru spiritual din sud-estul României.",
        shortDescription: "Ctitorie a domnitorului Matei Basarab, reconstruită după distrugerea din perioada comunistă în câmpia Bărăganului.",
        address: "Comuna Măxineni, Județul Brăila",
        region: "muntenia",
        city: "Măxineni",
        county: "Brăila",
        access: "Drumul național DN23, la aproximativ 30 km de orașul Brăila",
        patronSaint: "Sfinții Arhangheli Mihail și Gavriil",
        patronSaintDate: "2025-11-08", // Data fixă a sărbătorii
        foundedYear: 1637,
        history: "Ctitorită în 1637 de către domnitorul Matei Basarab, mănăstirea a fost un important centru cultural și spiritual în Țara Românească. A fost distrusă în totalitate în timpul regimului comunist (1958-1959) și reconstruită după 1990 pe vechile fundații.",
        specialFeatures: "Biserica actuală este o reconstrucție fidelă a celei originale, în stil muntenesc din secolul al XVII-lea. Mănăstirea este situată într-un cadru natural aparte, pe malul râului Siret.",
        relics: ["Părticele din moaștele Sfinților Arhangheli"],
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Maxineni_1.jpg",
        contactPhone: "0239638588",
        website: "https://www.manastirearmaxineni.ro/",
        latitude: 45.4333,
        longitude: 27.7167
      },
      {
        name: "Mănăstirea Cernica",
        description: "Mănăstirea Cernica, situată pe o insulă din apropierea Bucureștiului, este una dintre cele mai importante mănăstiri din Muntenia, fiind legată de personalitatea Sfântului Calinic de la Cernica și a altor importanți duhovnici români.",
        shortDescription: "Importantă mănăstire de lângă București, legată de Sfântul Calinic și alți mari duhovnici români.",
        address: "Comuna Cernica, Județul Ilfov",
        region: "muntenia",
        city: "Cernica",
        county: "Ilfov",
        access: "Drumul național DN3, la aproximativ 15 km de centrul Bucureștiului",
        patronSaint: "Sfântul Nicolae",
        patronSaintDate: "2025-12-06", // Data fixă a sărbătorii
        foundedYear: 1608,
        history: "Fondată în 1608 de către marele vornic Cernica Știrbei, mănăstirea a fost refăcută și organizată ca centru duhovnicesc în secolul al XIX-lea de către Sfântul Calinic de la Cernica. Aici au viețuit numeroși mari duhovnici români.",
        specialFeatures: "Complexul monastic este situat pe două insule din lacul Cernica și include patru biserici. Aici se află și un muzeu cu obiecte liturgice, cărți vechi și obiecte personale ale Sfântului Calinic.",
        relics: ["Moaștele Sfântului Calinic de la Cernica", "Icoana făcătoare de minuni a Maicii Domnului"],
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Cernica_1.jpg",
        contactPhone: "0214602050",
        website: "https://www.manastireacernica.ro/",
        latitude: 44.4333,
        longitude: 26.2667
      },
      {
        name: "Mănăstirea Văratec",
        description: "Mănăstirea Văratec este cea mai mare mănăstire de maici din România și una dintre cele mai importante din Moldova, având o bogată tradiție culturală și spirituală. Este legată de personalitatea starețelor Olimpiada Alcaz și Veronica Micle.",
        shortDescription: "Cea mai mare mănăstire de maici din România, cu o bogată tradiție culturală și spirituală legată de starețele Olimpiada și Veronica Micle.",
        address: "Comuna Agapia, Județul Neamț",
        region: "moldova",
        city: "Agapia",
        county: "Neamț",
        access: "Drumul județean DJ155I, la aproximativ 12 km de orașul Târgu Neamț",
        patronSaint: "Adormirea Maicii Domnului",
        patronSaintDate: "2025-08-15", // Data fixă a sărbătorii
        foundedYear: 1785,
        history: "Fondată în jurul anului 1785 de către maica Olimpiada, cu sprijinul duhovnicesc al ieroschimonahului Iosif de la Secu. În secolul al XIX-lea a devenit un important centru cultural și spiritual, aici viețuind și Veronica Micle, muza poetului Mihai Eminescu.",
        specialFeatures: "Biserica principală, cu arhitectură moldovenească din secolul al XIX-lea, a fost pictată de Nicolae Tonitza. Mănăstirea are un muzeu cu obiecte de artă, manuscrise, cărți vechi și broderii realizate de maici.",
        relics: ["Părticele din moaștele Sfântului Mare Mucenic Gheorghe"],
        type: "monastery",
        coverImage: "https://www.crestinortodox.ro/files/articole/original/Manastirea_Varatec_1.jpg",
        contactPhone: "0233244972",
        website: "https://www.manastireavaratec.ro/",
        latitude: 47.2006,
        longitude: 26.3072
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
        access: monastery.access || "Drum accesibil auto și pietonal",
        patronSaint: monastery.patronSaint,
        patronSaintDate: monastery.patronSaintDate ? new Date(monastery.patronSaintDate) : null,
        foundedYear: monastery.foundedYear || null,
        history: monastery.history || null,
        specialFeatures: monastery.specialFeatures || null,
        relics: monastery.relics || [],
        iconDescriptions: [], // Câmp nou, inițializat ca array gol
        images: monastery.images || [],
        coverImage: monastery.coverImage,
        type: monastery.type,
        verification: "verified",
        contactEmail: monastery.contactEmail || null,
        contactPhone: monastery.contactPhone || null,
        website: monastery.website || null,
        administratorId: null,
        latitude: monastery.latitude || null,
        longitude: monastery.longitude || null,
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
importCompleteMonasteries()
  .then(count => {
    console.log(`Import finalizat cu succes! S-au adăugat ${count} mănăstiri.`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Eroare la executarea scriptului:', error);
    process.exit(1);
  });