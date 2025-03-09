import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { 
  FileIcon, 
  DownloadIcon, 
  MailIcon, 
  InfoIcon, 
  ShieldIcon, 
  CookieIcon
} from 'lucide-react';

// Tipul de date pentru elementele CMS
type CmsItem = {
  key: string;
  contentType: 'text' | 'html' | 'image';
  value: string;
};

// Funcție comună pentru inițializarea conținutului CMS
const initializeCmsContent = async (items: CmsItem[], name: string, toast: any, refetch: () => Promise<any>) => {
  // Afișăm notificare de procesare
  toast({
    title: `Inițializare conținut ${name}`,
    description: "Procesare în curs... Vă rugăm așteptați.",
  });
  
  // Logăm datele pentru debugare
  console.log(`Pregătire cerere API pentru inițializare ${name}`, { 
    itemCount: items.length,
    firstItem: items[0]
  });
  
  try {
    // Trimitem cererea către server
    const response = await fetch('/api/cms/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Eroare la inițializare ${name}:`, errorData);
      toast({
        title: `Eroare la inițializare ${name}`,
        description: errorData.message || `A apărut o eroare la inițializarea conținutului ${name}.`,
        variant: "destructive",
      });
      return;
    }
    
    const result = await response.json();
    console.log(`Rezultat inițializare ${name}:`, result);
    
    // Invalidăm cache-ul pentru a reîncărca datele
    queryClient.invalidateQueries({ queryKey: ['/api/cms'] });
    queryClient.invalidateQueries();
    
    // Facem un refetch imediat
    await refetch();
    
    // Afișăm rezultatul final
    toast({
      title: `Inițializare ${name} completă`,
      description: `S-au creat ${result.stats?.created || 0} elemente noi, ${result.stats?.skipped || 0} elemente existente, ${result.stats?.errors || 0} erori.`,
      variant: (result.stats?.errors || 0) > 0 ? "destructive" : "default",
    });
  } catch (error) {
    console.error(`Excepție la inițializarea ${name}:`, error);
    toast({
      title: `Eroare la inițializare ${name}`,
      description: `A apărut o excepție la inițializarea conținutului ${name}.`,
      variant: "destructive",
    });
  }
};

// Componenta pentru inițializarea paginii Contact
export const ContactInitializer: React.FC<{refetch: () => Promise<any>}> = ({ refetch }) => {
  const { toast } = useToast();
  
  const contactItems: CmsItem[] = [
    { key: 'contact_title', contentType: 'text', value: 'Contactați-ne' },
    { key: 'contact_subtitle', contentType: 'text', value: 'Suntem aici pentru a vă ajuta' },
    
    { key: 'contact_office_title', contentType: 'text', value: 'Biroul nostru' },
    { key: 'contact_office_address', contentType: 'text', value: 'Str. Bisericii, Nr. 10, București' },
    { key: 'contact_office_phone', contentType: 'text', value: '0700 000 001' },
    { key: 'contact_office_email', contentType: 'text', value: 'office@doxapelerinaje.ro' },
    { key: 'contact_office_hours', contentType: 'text', value: 'Luni-Vineri: 9:00 - 17:00' },
    
    { key: 'contact_support_title', contentType: 'text', value: 'Suport clienți' },
    { key: 'contact_support_phone', contentType: 'text', value: '0700 000 002' },
    { key: 'contact_support_email', contentType: 'text', value: 'support@doxapelerinaje.ro' },
    { key: 'contact_emergency_phone', contentType: 'text', value: '0700 000 003' },
    
    { key: 'contact_form_name_label', contentType: 'text', value: 'Numele dumneavoastră' },
    { key: 'contact_form_email_label', contentType: 'text', value: 'Adresa de email' },
    { key: 'contact_form_phone_label', contentType: 'text', value: 'Număr de telefon' },
    { key: 'contact_form_subject_label', contentType: 'text', value: 'Subiect' },
    { key: 'contact_form_message_label', contentType: 'text', value: 'Mesajul dumneavoastră' },
    { key: 'contact_form_submit_text', contentType: 'text', value: 'Trimite mesajul' },
    
    { key: 'contact_map_title', contentType: 'text', value: 'Locația noastră' },
    { key: 'contact_map_embed', contentType: 'html', value: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2848.8444388087287!2d26.101384676942178!3d44.43635777107205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40b1ff4770adb5b7%3A0x58147f39579fe6fa!2zQnVjdXJlyJl0aQ!5e0!3m2!1sro!2sro!4v1707305001364!5m2!1sro!2sro" width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>' },
    
    { key: 'contact_social_title', contentType: 'text', value: 'Urmăriți-ne pe rețelele sociale' },
    { key: 'contact_social_facebook', contentType: 'text', value: 'Facebook' },
    { key: 'contact_social_facebook_url', contentType: 'text', value: 'https://facebook.com/doxapelerinaje' },
    { key: 'contact_social_instagram', contentType: 'text', value: 'Instagram' },
    { key: 'contact_social_instagram_url', contentType: 'text', value: 'https://instagram.com/doxapelerinaje' },
    { key: 'contact_social_youtube', contentType: 'text', value: 'YouTube' },
    { key: 'contact_social_youtube_url', contentType: 'text', value: 'https://youtube.com/doxapelerinaje' },
  ];
  
  return (
    <Button 
      variant="outline" 
      size="sm"
      className="bg-blue-50 hover:bg-blue-100"
      onClick={() => initializeCmsContent(contactItems, 'Contact', toast, refetch)}
    >
      <MailIcon className="h-4 w-4 mr-1" />
      Inițializează CMS Contact
    </Button>
  );
};

// Componenta pentru inițializarea paginii Despre noi
export const AboutInitializer: React.FC<{refetch: () => Promise<any>}> = ({ refetch }) => {
  const { toast } = useToast();
  
  const aboutItems: CmsItem[] = [
    { key: 'about_title', contentType: 'text', value: 'Despre Doxa Pelerinaje' },
    { key: 'about_subtitle', contentType: 'text', value: 'Călătorii spirituale cu profundă semnificație' },
    
    { key: 'about_mission_title', contentType: 'text', value: 'Misiunea noastră' },
    { key: 'about_mission_content', contentType: 'html', value: '<p>Doxa Pelerinaje s-a născut din dorința de a facilita călătoriile spirituale pentru credincioșii ortodocși. Misiunea noastră este să oferim experiențe de pelerinaj autentice, care să îmbine dimensiunea spirituală cu descoperirea patrimoniului cultural și religios.</p><p>Ne dorim să fim un pod între credincioși și locurile sfinte, facilitând accesul la experiențe transformatoare în comuniune cu valorile credinței ortodoxe.</p>' },
    
    { key: 'about_vision_title', contentType: 'text', value: 'Viziunea noastră' },
    { key: 'about_vision_content', contentType: 'html', value: '<p>Ne propunem să devenim cea mai respectată platformă de pelerinaje ortodoxe din România, recunoscută pentru calitatea serviciilor, autenticitatea experiențelor spirituale și impactul pozitiv în comunitățile pe care le vizităm.</p>' },
    
    { key: 'about_values_title', contentType: 'text', value: 'Valorile noastre' },
    { key: 'about_values_content', contentType: 'html', value: '<ul><li><strong>Autenticitate</strong> - Respectăm tradițiile și esența spirituală a fiecărui loc sfânt</li><li><strong>Respect</strong> - Tratăm cu respect fiecare pelerin, locurile vizitate și comunitățile locale</li><li><strong>Calitate</strong> - Oferim servicii de înaltă calitate în toate aspectele călătoriei</li><li><strong>Comunitate</strong> - Creăm experiențe care unesc oamenii în credință și spiritual</li><li><strong>Responsabilitate</strong> - Acționăm responsabil față de mediu, patrimoniu și comunitățile locale</li></ul>' },
    
    { key: 'about_team_title', contentType: 'text', value: 'Echipa noastră' },
    { key: 'about_team_content', contentType: 'html', value: '<p>Suntem o echipă de profesioniști pasionați, dedicați organizării de pelerinaje ortodoxe la cele mai înalte standarde. Echipa noastră include:</p><ul><li>Ghizi spirituali cu experiență</li><li>Specialiști în teologie și istorie bisericească</li><li>Experți în turism religios</li><li>Coordonatori logistici experimentați</li></ul>' },
    
    { key: 'about_history_title', contentType: 'text', value: 'Istoria noastră' },
    { key: 'about_history_content', contentType: 'html', value: '<p>Doxa Pelerinaje a fost fondată în 2023 de un grup de creștini ortodocși pasionați de spiritual și călătorii. De-a lungul anilor, am crescut constant, păstrând însă aceeași dedicare pentru calitate și autenticitate spirituală.</p><p>Astăzi, suntem mândri să facilităm experiențe de pelerinaj pentru mii de credincioși în fiecare an, contribuind la întărirea credinței și la descoperirea tezaurelor spirituale ortodoxe.</p>' },
    
    { key: 'about_partners_title', contentType: 'text', value: 'Partenerii noștri' },
    { key: 'about_partners_content', contentType: 'html', value: '<p>Colaborăm cu mănăstiri, biserici și alte organizații religioase pentru a oferi pelerinilor noștri cele mai autentice și semnificative experiențe spirituale.</p>' },
    
    { key: 'about_cta_title', contentType: 'text', value: 'Alăturați-vă nouă în următoarea călătorie' },
    { key: 'about_cta_text', contentType: 'text', value: 'Explorați pelerinajele noastre' },
    { key: 'about_cta_url', contentType: 'text', value: '/pelerinaje' },
  ];
  
  return (
    <Button 
      variant="outline" 
      size="sm"
      className="bg-green-50 hover:bg-green-100"
      onClick={() => initializeCmsContent(aboutItems, 'Despre noi', toast, refetch)}
    >
      <InfoIcon className="h-4 w-4 mr-1" />
      Inițializează CMS Despre noi
    </Button>
  );
};

// Componenta pentru inițializarea paginii Termeni și condiții
export const TermsInitializer: React.FC<{refetch: () => Promise<any>}> = ({ refetch }) => {
  const { toast } = useToast();
  
  const termsItems: CmsItem[] = [
    { key: 'terms_title', contentType: 'text', value: 'Termeni și condiții' },
    { key: 'terms_subtitle', contentType: 'text', value: 'Vă rugăm să citiți cu atenție' },
    { key: 'terms_last_updated', contentType: 'text', value: 'Ultima actualizare: 1 martie 2025' },
    
    { key: 'terms_intro', contentType: 'html', value: '<p>Acești Termeni și Condiții ("Termeni") reglementează utilizarea platformei Doxa Pelerinaje ("Platforma"), accesibilă la adresa www.doxapelerinaje.ro, operată de Doxa Pelerinaje SRL ("noi", "nouă").</p><p>Prin accesarea și utilizarea Platformei, confirmați că ați citit, înțeles și sunteți de acord să respectați acești Termeni. Dacă nu sunteți de acord cu oricare parte a acestor Termeni, vă rugăm să nu utilizați Platforma noastră.</p>' },
    
    { key: 'terms_definitions_title', contentType: 'text', value: 'Definiții' },
    { key: 'terms_definitions_content', contentType: 'html', value: '<ul><li><strong>Utilizator</strong>: orice persoană care accesează sau utilizează Platforma.</li><li><strong>Pelerin</strong>: orice Utilizator care se înregistrează, rezervă sau participă la un pelerinaj prin intermediul Platformei.</li><li><strong>Organizator</strong>: entitatea care organizează și oferă pelerinaje prin intermediul Platformei.</li><li><strong>Servicii</strong>: toate serviciile oferite de Platformă, inclusiv dar fără a se limita la: informații despre pelerinaje, posibilitatea de a rezerva pelerinaje, comunicare cu Organizatorii.</li></ul>' },
    
    { key: 'terms_account_title', contentType: 'text', value: 'Contul de utilizator' },
    { key: 'terms_account_content', contentType: 'html', value: '<p>Pentru a utiliza anumite funcționalități ale Platformei, trebuie să creați un cont. Sunteți responsabili pentru menținerea confidențialității credențialelor contului dumneavoastră și pentru toate activitățile desfășurate din contul dumneavoastră.</p><p>Vă angajați să ne notificați imediat cu privire la orice utilizare neautorizată a contului dumneavoastră sau la orice încălcare a securității. Nu putem și nu vom fi răspunzători pentru nicio pierdere sau daună rezultată din nerespectarea acestei obligații de securitate.</p>' },
    
    { key: 'terms_bookings_title', contentType: 'text', value: 'Rezervări și plăți' },
    { key: 'terms_bookings_content', contentType: 'html', value: '<p>Prin efectuarea unei rezervări pe Platformă, încheiați un contract direct cu Organizatorul pelerinajului respectiv. Noi acționăm doar ca intermediar între dumneavoastră și Organizator.</p><p>Plățile efectuate prin Platformă sunt procesate prin furnizori terți de servicii de plată. Nu stocăm informațiile despre cardul dumneavoastră de credit. Toate plățile sunt supuse termenilor și condițiilor furnizorului de servicii de plată.</p>' },
    
    { key: 'terms_cancellation_title', contentType: 'text', value: 'Politica de anulare' },
    { key: 'terms_cancellation_content', contentType: 'html', value: '<p>Politicile de anulare variază în funcție de Organizator și sunt specificate în detaliile fiecărui pelerinaj. Este responsabilitatea dumneavoastră să verificați politica de anulare înainte de a face o rezervare.</p><p>În general, anulările efectuate cu mai puțin de 14 zile înainte de data de începere a pelerinajului pot fi supuse unor taxe de anulare.</p>' },
    
    { key: 'terms_conduct_title', contentType: 'text', value: 'Codul de conduită' },
    { key: 'terms_conduct_content', contentType: 'html', value: '<p>Ca Utilizator al Platformei, sunteți de acord să nu:</p><ul><li>Utilizați Platforma într-un mod care încalcă legile sau reglementările aplicabile.</li><li>Utilizați Platforma pentru a transmite sau distribui materiale ilegale, defăimătoare, hărțuitoare, abuzive sau obscene.</li><li>Interferați cu sau întrerupeți funcționarea Platformei sau a serverelor sau rețelelor conectate la Platformă.</li><li>Încercați să obțineți acces neautorizat la orice parte a Platformei sau la orice sistem sau rețea conectată la Platformă.</li></ul>' },
    
    { key: 'terms_intellectual_property_title', contentType: 'text', value: 'Proprietatea intelectuală' },
    { key: 'terms_intellectual_property_content', contentType: 'html', value: '<p>Toate conținuturile Platformei, inclusiv dar fără a se limita la: texte, grafice, logo-uri, icoane, imagini, clipuri audio, descărcări digitale și compilații de date, sunt proprietatea noastră sau a licențiatorilor noștri și sunt protejate de legile privind drepturile de autor și alte legi privind proprietatea intelectuală.</p><p>Nu aveți dreptul să reproduceți, distribuiți, modificați, afișați public, executați public, republicați, descărcați, stocați sau transmiteți orice conținut de pe Platformă fără acordul nostru prealabil scris.</p>' },
    
    { key: 'terms_liability_title', contentType: 'text', value: 'Limitarea răspunderii' },
    { key: 'terms_liability_content', contentType: 'html', value: '<p>În niciun caz nu vom fi răspunzători pentru daune directe, indirecte, incidentale, speciale sau consecvente care rezultă din utilizarea sau incapacitatea de a utiliza Platforma.</p><p>Nu ne asumăm răspunderea pentru acțiunile, conținutul, informațiile sau datele terților. În măsura permisă de lege, răspunderea noastră totală față de dumneavoastră pentru orice cereri în temeiul acestor Termeni, inclusiv pentru orice garanții implicite, este limitată la suma pe care ne-ați plătit-o în ultimele 12 luni pentru a utiliza Platforma.</p>' },
    
    { key: 'terms_modifications_title', contentType: 'text', value: 'Modificări ale Termenilor' },
    { key: 'terms_modifications_content', contentType: 'html', value: '<p>Ne rezervăm dreptul de a modifica acești Termeni în orice moment. Vom notifica utilizatorii cu privire la orice modificări semnificative prin postarea noilor Termeni pe această pagină și/sau prin trimiterea unei notificări prin e-mail.</p><p>Continuarea utilizării Platformei după publicarea modificărilor aduse Termenilor va constitui acceptarea de către dumneavoastră a noilor Termeni.</p>' },
    
    { key: 'terms_governing_law_title', contentType: 'text', value: 'Legea aplicabilă' },
    { key: 'terms_governing_law_content', contentType: 'html', value: '<p>Acești Termeni sunt reglementați și interpretați în conformitate cu legile României, fără a ține cont de principiile conflictului de legi.</p><p>Orice litigiu care rezultă din sau în legătură cu acești Termeni va fi supus jurisdicției exclusive a instanțelor din București, România.</p>' },
    
    { key: 'terms_contact_title', contentType: 'text', value: 'Contact' },
    { key: 'terms_contact_content', contentType: 'html', value: '<p>Pentru orice întrebări sau preocupări cu privire la acești Termeni, vă rugăm să ne contactați la:</p><p>Doxa Pelerinaje SRL<br>Adresa: Str. Bisericii, Nr. 10, București<br>Email: legal@doxapelerinaje.ro<br>Telefon: 0700 000 000</p>' },
  ];
  
  return (
    <Button 
      variant="outline" 
      size="sm"
      className="bg-purple-50 hover:bg-purple-100"
      onClick={() => initializeCmsContent(termsItems, 'Termeni și condiții', toast, refetch)}
    >
      <FileIcon className="h-4 w-4 mr-1" />
      Inițializează CMS Termeni
    </Button>
  );
};

// Componenta pentru inițializarea paginii Politica de confidențialitate
export const PrivacyInitializer: React.FC<{refetch: () => Promise<any>}> = ({ refetch }) => {
  const { toast } = useToast();
  
  const privacyItems: CmsItem[] = [
    { key: 'privacy_title', contentType: 'text', value: 'Politica de confidențialitate' },
    { key: 'privacy_subtitle', contentType: 'text', value: 'Protejăm datele dumneavoastră personale' },
    { key: 'privacy_last_updated', contentType: 'text', value: 'Ultima actualizare: 1 martie 2025' },
    
    { key: 'privacy_intro', contentType: 'html', value: '<p>Această Politică de confidențialitate descrie modul în care Doxa Pelerinaje SRL ("noi", "nouă") colectează, utilizează și divulgă informațiile dumneavoastră personale când utilizați platforma noastră www.doxapelerinaje.ro ("Platforma").</p><p>Vă rugăm să citiți această politică cu atenție pentru a înțelege practicile noastre privind datele dumneavoastră personale și modul în care le vom trata.</p>' },
    
    { key: 'privacy_data_collected_title', contentType: 'text', value: 'Informații pe care le colectăm' },
    { key: 'privacy_data_collected_content', contentType: 'html', value: '<p>Putem colecta următoarele tipuri de informații:</p><ul><li><strong>Informații personale</strong>: Nume, adresă de e-mail, număr de telefon, adresă poștală, data nașterii, detalii despre documentul de identitate (pentru anumite pelerinaje).</li><li><strong>Informații despre cont</strong>: Nume de utilizator, parolă (stocată în format criptat), preferințe de cont.</li><li><strong>Informații despre tranzacții</strong>: Detalii despre pelerinajele rezervate, istoricul plăților (nu stocăm informații complete despre cardul de credit).</li><li><strong>Informații tehnice</strong>: Adresa IP, tipul browserului, timpul petrecut pe Platformă, paginile vizitate, identificatori unici de dispozitiv.</li><li><strong>Comunicări</strong>: Corespondența cu noi, inclusiv recenzii, evaluări, solicitări de asistență.</li></ul>' },
    
    { key: 'privacy_data_use_title', contentType: 'text', value: 'Cum utilizăm informațiile dumneavoastră' },
    { key: 'privacy_data_use_content', contentType: 'html', value: '<p>Utilizăm informațiile pe care le colectăm pentru:</p><ul><li>Furnizarea și personalizarea serviciilor noastre</li><li>Procesarea și gestionarea rezervărilor și plăților</li><li>Comunicarea cu dumneavoastră despre rezervări, modificări sau asistență</li><li>Trimiterea de informații despre oferte, noi pelerinaje sau actualizări (cu consimțământul dumneavoastră)</li><li>Îmbunătățirea și dezvoltarea Platformei noastre</li><li>Analizarea tendințelor de utilizare și eficienței marketingului</li><li>Prevenirea fraudelor și protejarea securității Platformei noastre</li><li>Respectarea obligațiilor noastre legale</li></ul>' },
    
    { key: 'privacy_data_sharing_title', contentType: 'text', value: 'Divulgarea informațiilor' },
    { key: 'privacy_data_sharing_content', contentType: 'html', value: '<p>Putem partaja informațiile dumneavoastră cu:</p><ul><li><strong>Organizatori de pelerinaje</strong>: Pentru a facilita rezervările și a furniza serviciile solicitate.</li><li><strong>Furnizori de servicii</strong>: Terți care ne ajută să operăm Platforma, cum ar fi procesatori de plăți, furnizori de servicii de găzduire și analiză.</li><li><strong>Autorități legale</strong>: Când este necesar pentru a respecta legea, reglementările, procesele legale sau solicitările guvernamentale aplicabile.</li><li><strong>În cazul unei fuziuni sau achiziții</strong>: Dacă suntem implicați într-o fuziune, achiziție sau vânzare de active, informațiile dumneavoastră pot fi transferate ca parte a acelei tranzacții.</li></ul><p>Nu vom vinde sau închiria informațiile dumneavoastră personale către terți pentru scopuri de marketing fără consimțământul dumneavoastră explicit.</p>' },
    
    { key: 'privacy_data_security_title', contentType: 'text', value: 'Securitatea datelor' },
    { key: 'privacy_data_security_content', contentType: 'html', value: '<p>Luăm măsuri tehnice și organizaționale adecvate pentru a proteja informațiile dumneavoastră personale împotriva pierderii, utilizării abuzive sau modificării neautorizate. Acestea includ:</p><ul><li>Criptarea datelor sensibile</li><li>Accesul restricționat la informațiile personale</li><li>Utilizarea tehnologiilor de securitate avansate</li><li>Revizuirea regulată a practicilor noastre de securitate</li></ul><p>Cu toate acestea, nicio metodă de transmitere pe internet sau de stocare electronică nu este 100% sigură, și nu putem garanta securitatea absolută a datelor dumneavoastră.</p>' },
    
    { key: 'privacy_data_retention_title', contentType: 'text', value: 'Păstrarea datelor' },
    { key: 'privacy_data_retention_content', contentType: 'html', value: '<p>Păstrăm informațiile dumneavoastră personale atât timp cât este necesar pentru a îndeplini scopurile pentru care le-am colectat, inclusiv pentru a satisface orice cerințe legale, contabile sau de raportare.</p><p>Pentru a determina perioada adecvată de păstrare a datelor personale, luăm în considerare cantitatea, natura și sensibilitatea datelor personale, riscul potențial de daune din utilizarea neautorizată sau divulgarea datelor dumneavoastră personale, scopurile pentru care procesăm datele dumneavoastră personale și dacă putem atinge aceste scopuri prin alte mijloace, precum și cerințele legale aplicabile.</p>' },
    
    { key: 'privacy_your_rights_title', contentType: 'text', value: 'Drepturile dumneavoastră' },
    { key: 'privacy_your_rights_content', contentType: 'html', value: '<p>În funcție de jurisdicția dumneavoastră, puteți avea anumite drepturi cu privire la informațiile dumneavoastră personale, inclusiv:</p><ul><li>Dreptul de a accesa informațiile dumneavoastră personale</li><li>Dreptul de a corecta informațiile inexacte</li><li>Dreptul de a șterge informațiile dumneavoastră personale</li><li>Dreptul de a restricționa sau obiecta la procesarea informațiilor dumneavoastră</li><li>Dreptul la portabilitatea datelor</li><li>Dreptul de a retrage consimțământul în orice moment</li></ul><p>Pentru a vă exercita oricare dintre aceste drepturi, vă rugăm să ne contactați utilizând detaliile de contact furnizate mai jos.</p>' },
    
    { key: 'privacy_cookies_title', contentType: 'text', value: 'Cookie-uri și tehnologii similare' },
    { key: 'privacy_cookies_content', contentType: 'html', value: '<p>Utilizăm cookie-uri și tehnologii similare pentru a îmbunătăți experiența dumneavoastră pe Platforma noastră. Pentru informații detaliate despre cum utilizăm aceste tehnologii, vă rugăm să consultați Politica noastră privind Cookie-urile.</p>' },
    
    { key: 'privacy_children_title', contentType: 'text', value: 'Confidențialitatea copiilor' },
    { key: 'privacy_children_content', contentType: 'html', value: '<p>Platforma noastră nu este destinată copiilor sub 16 ani și nu colectăm cu bună știință informații personale de la copii sub această vârstă. Dacă aflăm că am colectat informații personale de la un copil sub 16 ani fără verificarea consimțământului parental, vom lua măsuri pentru a elimina aceste informații.</p>' },
    
    { key: 'privacy_changes_title', contentType: 'text', value: 'Modificări ale acestei politici' },
    { key: 'privacy_changes_content', contentType: 'html', value: '<p>Putem actualiza această Politică de confidențialitate din când în când pentru a reflecta modificările practicilor noastre de informații sau din alte motive operaționale, legale sau de reglementare. Vă vom notifica cu privire la orice modificări materiale prin postarea noii Politici pe această pagină și/sau prin trimiterea unui e-mail la adresa de e-mail asociată contului dumneavoastră.</p><p>Vă încurajăm să revizuiți periodic această Politică pentru a fi informat despre cum vă protejăm informațiile.</p>' },
    
    { key: 'privacy_contact_title', contentType: 'text', value: 'Contact' },
    { key: 'privacy_contact_content', contentType: 'html', value: '<p>Dacă aveți întrebări despre această Politică de confidențialitate sau despre practicile noastre privind datele, vă rugăm să ne contactați la:</p><p>Doxa Pelerinaje SRL<br>Adresa: Str. Bisericii, Nr. 10, București<br>Email: privacy@doxapelerinaje.ro<br>Telefon: 0700 000 000</p>' },
  ];
  
  return (
    <Button 
      variant="outline" 
      size="sm"
      className="bg-indigo-50 hover:bg-indigo-100"
      onClick={() => initializeCmsContent(privacyItems, 'Politică de confidențialitate', toast, refetch)}
    >
      <ShieldIcon className="h-4 w-4 mr-1" />
      Inițializează CMS Confidențialitate
    </Button>
  );
};

// Componenta pentru inițializarea paginii Cookies
export const CookiesInitializer: React.FC<{refetch: () => Promise<any>}> = ({ refetch }) => {
  const { toast } = useToast();
  
  const cookiesItems: CmsItem[] = [
    { key: 'cookies_title', contentType: 'text', value: 'Politica de Cookies' },
    { key: 'cookies_subtitle', contentType: 'text', value: 'Informații despre cum utilizăm cookie-urile' },
    { key: 'cookies_last_updated', contentType: 'text', value: 'Ultima actualizare: 1 martie 2025' },
    
    { key: 'cookies_intro', contentType: 'html', value: '<p>Această Politică de Cookies explică ce sunt cookie-urile și cum le folosim pe platforma Doxa Pelerinaje ("Platforma"). Vă rugăm să citiți această politică pentru a înțelege ce sunt cookie-urile, cum le utilizăm, ce tipuri de cookie-uri folosim, ce informații colectăm folosind cookie-uri și cum gestionăm aceste informații.</p>' },
    
    { key: 'cookies_what_are_title', contentType: 'text', value: 'Ce sunt cookie-urile' },
    { key: 'cookies_what_are_content', contentType: 'html', value: '<p>Cookie-urile sunt fișiere text mici care sunt stocate pe dispozitivul dumneavoastră (computer, tabletă sau telefon mobil) atunci când vizitați un site web. Cookie-urile sunt utilizate pe scară largă pentru a face website-urile să funcționeze sau să funcționeze mai eficient, precum și pentru a furniza informații proprietarilor site-ului.</p><p>Cookie-urile îndeplinesc diverse funcții, cum ar fi permiterea navigării eficiente între pagini, memorarea preferințelor dumneavoastră și, în general, îmbunătățirea experienței utilizatorului. Ele pot, de asemenea, să ajute la asigurarea faptului că reclamele pe care le vedeți online sunt mai relevante pentru dumneavoastră și interesele dumneavoastră.</p>' },
    
    { key: 'cookies_how_we_use_title', contentType: 'text', value: 'Cum utilizăm cookie-urile' },
    { key: 'cookies_how_we_use_content', contentType: 'html', value: '<p>Utilizăm cookie-uri pentru:</p><ul><li>Asigurarea funcționării corecte a Platformei</li><li>Salvarea preferințelor dumneavoastră pentru viitoare vizite</li><li>Personalizarea experienței dumneavoastră pe Platformă</li><li>Analizarea modului în care este utilizată Platforma pentru a o îmbunătăți</li><li>Furnizarea de conținut și publicitate mai relevante pentru interesele dumneavoastră</li></ul>' },
    
    { key: 'cookies_types_title', contentType: 'text', value: 'Tipuri de cookie-uri pe care le folosim' },
    { key: 'cookies_types_content', contentType: 'html', value: '<p>Folosim următoarele tipuri de cookie-uri:</p><ul><li><strong>Cookie-uri strict necesare</strong>: Acestea sunt cookie-uri care sunt necesare pentru funcționarea Platformei noastre. Ele includ, de exemplu, cookie-uri care vă permit să vă autentificați în contul dumneavoastră și să realizați rezervări securizate.</li><li><strong>Cookie-uri analitice/de performanță</strong>: Ne permit să recunoaștem și să numărăm vizitatorii și să vedem cum aceștia navighează în timpul utilizării Platformei. Acest lucru ne ajută să îmbunătățim modul în care funcționează Platforma noastră, de exemplu, asigurându-ne că utilizatorii găsesc ușor ceea ce caută.</li><li><strong>Cookie-uri de funcționalitate</strong>: Acestea sunt utilizate pentru a vă recunoaște când reveniți pe Platforma noastră. Aceasta ne permite să personalizăm conținutul nostru pentru dumneavoastră, să vă salutăm pe nume și să ne amintim preferințele dumneavoastră (de exemplu, alegerea limbii sau regiunii).</li><li><strong>Cookie-uri de targetare</strong>: Aceste cookie-uri înregistrează vizita dumneavoastră pe Platforma noastră, paginile pe care le-ați vizitat și link-urile pe care le-ați urmat. Vom folosi aceste informații pentru a face Platforma noastră și publicitatea afișată pe ea mai relevante pentru interesele dumneavoastră.</li></ul>' },
    
    { key: 'cookies_third_party_title', contentType: 'text', value: 'Cookie-uri terțe' },
    { key: 'cookies_third_party_content', contentType: 'html', value: '<p>Pe lângă cookie-urile noastre, permitem unor terțe părți să plaseze cookie-uri pe dispozitivul dumneavoastră atunci când vizitați Platforma noastră. Aceste terțe părți includ:</p><ul><li>Furnizori de servicii de analiză (cum ar fi Google Analytics), care ne ajută să analizăm cum este utilizată Platforma noastră.</li><li>Rețele de social media (cum ar fi Facebook, Instagram), care vă permit să partajați conținut de pe Platforma noastră pe rețelele de socializare.</li><li>Furnizori de servicii de publicitate, care pot utiliza cookie-uri pentru a furniza reclame relevante pentru interesele dumneavoastră.</li></ul><p>Aceste terțe părți pot avea propriile politici de confidențialitate și pot colecta și utiliza informațiile dumneavoastră în conformitate cu aceste politici.</p>' },
    
    { key: 'cookies_control_title', contentType: 'text', value: 'Cum să controlați cookie-urile' },
    { key: 'cookies_control_content', contentType: 'html', value: '<p>Puteți controla și gestiona cookie-urile în diverse moduri. Vă rugăm să țineți cont de faptul că eliminarea sau blocarea cookie-urilor poate afecta experiența dumneavoastră de utilizator și este posibil să nu puteți accesa anumite zone ale Platformei noastre.</p><p><strong>Setări browser</strong>: Majoritatea browserelor web vă permit să controlați cookie-urile prin setările de preferințe. Aceste setări se găsesc de obicei în meniul "opțiuni" sau "preferințe" al browserului dumneavoastră. Pentru a înțelege aceste setări, următoarele link-uri pot fi utile:</p><ul><li><a href="https://support.google.com/chrome/answer/95647" target="_blank">Cookie settings in Chrome</a></li><li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank">Cookie settings in Firefox</a></li><li><a href="https://support.microsoft.com/en-us/help/17442/windows-internet-explorer-delete-manage-cookies" target="_blank">Cookie settings in Internet Explorer</a></li><li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank">Cookie settings in Safari</a></li></ul><p><strong>Instrumente de refuz</strong>: De asemenea, puteți refuza cookie-urile prin instrumente disponibile pe Platforma noastră, cum ar fi banner-ul de cookie-uri care apare când vizitați pentru prima dată Platforma.</p>' },
    
    { key: 'cookies_changes_title', contentType: 'text', value: 'Modificări ale acestei politici' },
    { key: 'cookies_changes_content', contentType: 'html', value: '<p>Putem actualiza această Politică de Cookies din când în când pentru a reflecta modificările în practicile noastre sau din alte motive operaționale, legale sau de reglementare. Vă încurajăm să revizuiți periodic această Politică pentru a fi informat despre cum utilizăm cookie-urile.</p>' },
    
    { key: 'cookies_contact_title', contentType: 'text', value: 'Contact' },
    { key: 'cookies_contact_content', contentType: 'html', value: '<p>Dacă aveți întrebări despre utilizarea cookie-urilor sau alte tehnologii, vă rugăm să ne contactați la:</p><p>Doxa Pelerinaje SRL<br>Adresa: Str. Bisericii, Nr. 10, București<br>Email: privacy@doxapelerinaje.ro<br>Telefon: 0700 000 000</p>' },
  ];
  
  return (
    <Button 
      variant="outline" 
      size="sm"
      className="bg-yellow-50 hover:bg-yellow-100"
      onClick={() => initializeCmsContent(cookiesItems, 'Cookies', toast, refetch)}
    >
      <CookieIcon className="h-4 w-4 mr-1" />
      Inițializează CMS Cookies
    </Button>
  );
};

// Componenta pentru inițializarea link-urilor personalizate în footer
export const FooterLinksInitializer: React.FC<{refetch: () => Promise<any>}> = ({ refetch }) => {
  const { toast } = useToast();
  
  const footerLinksItems: CmsItem[] = [
    // Link-uri dinamice pentru secțiunea de linkuri legale din footer (lângă Termeni și Condiții)
    { key: 'footer_legal_links_title', contentType: 'text', value: 'Informații Legale' },
    
    // Link 1 - ANPC
    { key: 'footer_legal_link1_text', contentType: 'text', value: 'ANPC' },
    { key: 'footer_legal_link1_url', contentType: 'text', value: 'https://anpc.ro/' },
    
    // Link 2 - SOL (Soluționarea Online a Litigiilor)
    { key: 'footer_legal_link2_text', contentType: 'text', value: 'SOL' },
    { key: 'footer_legal_link2_url', contentType: 'text', value: 'https://ec.europa.eu/consumers/odr/' },
    
    // Link 3 - Licențe și autorizații
    { key: 'footer_legal_link3_text', contentType: 'text', value: 'Licențe' },
    { key: 'footer_legal_link3_url', contentType: 'text', value: '/licente' },
    
    // Link 4 - FAQ
    { key: 'footer_legal_link4_text', contentType: 'text', value: 'Întrebări Frecvente' },
    { key: 'footer_legal_link4_url', contentType: 'text', value: '/faq' },
    
    // Link 5 - Blog
    { key: 'footer_legal_link5_text', contentType: 'text', value: 'Blog' },
    { key: 'footer_legal_link5_url', contentType: 'text', value: '/blog' },
  ];
  
  return (
    <Button 
      variant="outline" 
      size="sm"
      className="bg-gray-50 hover:bg-gray-100"
      onClick={() => initializeCmsContent(footerLinksItems, 'Link-uri Footer', toast, refetch)}
    >
      <FileIcon className="h-4 w-4 mr-1" />
      Inițializează Link-uri Footer
    </Button>
  );
};

// Export componenta principală care include toți inițializatorii
export const CmsInitializers: React.FC<{refetch: () => Promise<any>}> = ({ refetch }) => {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <ContactInitializer refetch={refetch} />
      <AboutInitializer refetch={refetch} />
      <TermsInitializer refetch={refetch} />
      <PrivacyInitializer refetch={refetch} />
      <CookiesInitializer refetch={refetch} />
      <FooterLinksInitializer refetch={refetch} />
    </div>
  );
};

export default CmsInitializers;