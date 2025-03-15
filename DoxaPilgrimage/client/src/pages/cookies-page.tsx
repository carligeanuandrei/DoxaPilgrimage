import { Helmet } from 'react-helmet';
import { CmsHtml } from '@/components/shared/cms-display';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Helmet>
        <title>Politica de Cookies | Doxa Pelerinaje</title>
        <meta name="description" content="Politica de cookies a platformei Doxa Pelerinaje. Informații despre modul în care utilizăm cookie-urile și alte tehnologii similare." />
      </Helmet>

      <div className="container mx-auto px-4 py-16">
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Înapoi la pagina principală
            </Link>
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold mb-6 border-b pb-4">Politica de Cookies</h1>
          
          <div className="prose prose-primary max-w-none">
            <CmsHtml 
              contentKey="cookies_policy_content" 
              fallback={`
                <h2>1. Ce sunt Cookie-urile?</h2>
                <p>Cookie-urile sunt fișiere text de mici dimensiuni pe care site-urile web le plasează pe dispozitivul dumneavoastră atunci când le vizitați. Acestea sunt procesate și stocate de browser-ul dumneavoastră. În sine, cookie-urile sunt inofensive și servesc funcții esențiale pentru funcționarea site-urilor web.</p>
                
                <h2>2. Tipuri de Cookie-uri pe care le Utilizăm</h2>
                <p>Platforma Doxa Pelerinaje utilizează următoarele tipuri de cookie-uri:</p>
                
                <h3>a) Cookie-uri Strict Necesare</h3>
                <p>Aceste cookie-uri sunt esențiale pentru funcționarea platformei noastre și nu pot fi dezactivate. Ele permit funcționalități de bază precum navigarea în site, accesarea zonelor securizate, și gestionarea coșului de cumpărături.</p>
                <p>Exemple:</p>
                <ul>
                  <li>Cookie-uri de sesiune pentru autentificare</li>
                  <li>Cookie-uri pentru gestionarea coșului de cumpărături</li>
                  <li>Cookie-uri de securitate pentru protecția utilizatorilor</li>
                </ul>
                
                <h3>b) Cookie-uri Analitice/de Performanță</h3>
                <p>Aceste cookie-uri ne permit să numărăm vizitele și sursele de trafic, pentru a măsura și îmbunătăți performanța platformei noastre. Ne ajută să știm care pagini sunt cele mai populare sau mai puțin populare și să vedem cum navighează vizitatorii prin site.</p>
                <p>Exemple:</p>
                <ul>
                  <li>Google Analytics</li>
                  <li>Hotjar</li>
                </ul>
                
                <h3>c) Cookie-uri de Funcționalitate</h3>
                <p>Aceste cookie-uri permit platformei să ofere funcționalități și personalizări îmbunătățite. Ele pot fi setate de noi sau de furnizori terți ale căror servicii le-am adăugat.</p>
                <p>Exemple:</p>
                <ul>
                  <li>Cookie-uri pentru preferințele de limbă</li>
                  <li>Cookie-uri pentru locație</li>
                </ul>
                
                <h3>d) Cookie-uri de Marketing/Targetare</h3>
                <p>Aceste cookie-uri pot fi setate de partenerii noștri de publicitate. Ele pot fi folosite de aceste companii pentru a construi un profil al intereselor dumneavoastră și pentru a vă arăta reclame relevante pe alte site-uri.</p>
                <p>Exemple:</p>
                <ul>
                  <li>Cookie-uri pentru reclame personalizate</li>
                  <li>Cookie-uri pentru partajare pe rețele sociale</li>
                </ul>
                
                <h2>3. Durata de Stocare a Cookie-urilor</h2>
                <p>Cookie-urile pot fi de două tipuri, în funcție de durata lor de viață:</p>
                <ul>
                  <li><strong>Cookie-uri de sesiune:</strong> sunt temporare și expiră când închideți browser-ul.</li>
                  <li><strong>Cookie-uri persistente:</strong> rămân în browser până când le ștergeți manual sau până când browser-ul le șterge în funcție de durata de viață setată în cookie.</li>
                </ul>
                
                <h2>4. Controlul Cookie-urilor</h2>
                <p>Puteți controla și gestiona cookie-urile în diferite moduri:</p>
                <ul>
                  <li><strong>Setările browser-ului:</strong> Majoritatea browser-elor vă permit să vedeți ce cookie-uri aveți și să le ștergeți individual sau să blocați cookie-urile de la anumite sau toate site-urile.</li>
                  <li><strong>Banner-ul de cookie-uri:</strong> La prima vizită pe platforma noastră, veți vedea un banner care vă informează despre utilizarea cookie-urilor și vă permite să selectați ce categorii de cookie-uri acceptați.</li>
                </ul>
                <p>Rețineți că blocarea anumitor cookie-uri poate afecta experiența dumneavoastră pe platformă și serviciile pe care le putem oferi.</p>
                
                <h2>5. Cookie-uri Terțe</h2>
                <p>Platforma noastră poate utiliza servicii de la terți care setează propriile cookie-uri, cum ar fi Google Analytics, Stripe pentru plăți, sau butoane de partajare pentru rețelele sociale. Aceste servicii terțe au propriile politici de confidențialitate și de utilizare a cookie-urilor.</p>
                
                <h2>6. Modificări ale Politicii de Cookie-uri</h2>
                <p>Ne rezervăm dreptul de a modifica această politică de cookie-uri în orice moment. Orice modificări vor fi publicate pe această pagină. Vă încurajăm să verificați periodic această pagină pentru a fi la curent cu eventualele modificări.</p>
                
                <h2>7. Contact</h2>
                <p>Dacă aveți întrebări sau nelămuriri cu privire la utilizarea cookie-urilor pe platforma noastră, vă rugăm să ne contactați utilizând informațiile din secțiunea de contact a site-ului.</p>
                
                <p class="text-sm text-muted-foreground mt-8">Ultima actualizare: 9 martie 2025</p>
              `}
              refreshInterval={5000}
            />
          </div>
        </div>
      </div>
    </div>
  );
}