import { Helmet } from 'react-helmet';
import { CmsHtml } from '@/components/shared/cms-display';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Helmet>
        <title>Despre Noi | Doxa Pelerinaje</title>
        <meta name="description" content="Află povestea noastră, misiunea și valorile care ne ghidează în organizarea pelerinajelor. Doxa conectează pelerini și organizatori de încredere pentru experiențe spirituale autentice." />
      </Helmet>

      <div className="container mx-auto px-4 py-16">
        {/* Hero section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <CmsHtml 
              contentKey="about_page_title" 
              fallback="Despre Doxa Pelerinaje" 
            />
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            <CmsHtml 
              contentKey="about_page_subtitle" 
              fallback="Descoperă povestea noastră și misiunea care ne ghidează în organizarea de pelerinaje ortodoxe autentice."
            />
          </p>
        </div>

        {/* About section */}
        <div className="grid md:grid-cols-2 gap-12 mb-20 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">
              <CmsHtml 
                contentKey="about_mission_title" 
                fallback="Misiunea Noastră" 
              />
            </h2>
            <div className="prose prose-lg max-w-none">
              <CmsHtml 
                contentKey="about_mission_content" 
                fallback="<p>Doxa a fost creată cu scopul de a facilita accesul credincioșilor ortodocși la locuri sfinte și experiențe spirituale autentice. Misiunea noastră este să construim o punte între pelerini și organizatorii de pelerinaje de încredere, oferind un spațiu digital sigur și transparent.</p><p>Credem că pelerinajele nu sunt simple călătorii turistice, ci experiențe transformatoare care conectează credincioșii cu tradițiile și locurile sfinte ale ortodoxiei. Ne-am angajat să promovăm pelerinaje care respectă valorile ortodoxe autentice și care oferă pelerinilor oportunitatea de a-și aprofunda credința.</p>"
              />
            </div>
          </div>
          <div className="relative h-96 rounded-lg overflow-hidden shadow-lg">
            <CmsImage 
              contentKey="about_mission_image" 
              fallbackSrc="https://images.unsplash.com/photo-1566599045340-44202bc8a3fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
              alt="Misiunea Doxa Pelerinaje"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Values section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-10 text-center">
            <CmsHtml 
              contentKey="about_values_title" 
              fallback="Valorile Noastre" 
            />
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">
                <CmsHtml 
                  contentKey="about_value1_title" 
                  fallback="Autenticitate" 
                />
              </h3>
              <p className="text-neutral-600 text-center">
                <CmsHtml 
                  contentKey="about_value1_content" 
                  fallback="Promovăm experiențe spirituale autentice care respectă tradiția și valorile ortodoxe, fără compromisuri comerciale."
                />
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">
                <CmsHtml 
                  contentKey="about_value2_title" 
                  fallback="Comunitate" 
                />
              </h3>
              <p className="text-neutral-600 text-center">
                <CmsHtml 
                  contentKey="about_value2_content" 
                  fallback="Credem în puterea comunității și în importanța conexiunilor spirituale create între pelerini în timpul călătoriilor sfinte."
                />
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">
                <CmsHtml 
                  contentKey="about_value3_title" 
                  fallback="Încredere" 
                />
              </h3>
              <p className="text-neutral-600 text-center">
                <CmsHtml 
                  contentKey="about_value3_content" 
                  fallback="Verificăm cu atenție toți organizatorii de pelerinaje pentru a asigura standarde înalte de calitate, siguranță și autenticitate spirituală."
                />
              </p>
            </div>
          </div>
        </div>

        {/* Team section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-10 text-center">
            <CmsHtml 
              contentKey="about_team_title" 
              fallback="Echipa Noastră" 
            />
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-40 h-40 rounded-full overflow-hidden mx-auto mb-6">
                <CmsImage 
                  contentKey="about_team_member1_image" 
                  fallbackSrc="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                  alt="Membru echipa"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold mb-2">
                <CmsHtml 
                  contentKey="about_team_member1_name" 
                  fallback="Alexandru Popescu" 
                />
              </h3>
              <p className="text-primary font-medium mb-4">
                <CmsHtml 
                  contentKey="about_team_member1_position" 
                  fallback="Fondator & Director" 
                />
              </p>
              <p className="text-neutral-600">
                <CmsHtml 
                  contentKey="about_team_member1_bio" 
                  fallback="Cu peste 15 ani de experiență în organizarea de pelerinaje ortodoxe și o pasiune pentru locurile sfinte." 
                />
              </p>
            </div>
            <div className="text-center">
              <div className="w-40 h-40 rounded-full overflow-hidden mx-auto mb-6">
                <CmsImage 
                  contentKey="about_team_member2_image" 
                  fallbackSrc="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                  alt="Membru echipa"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold mb-2">
                <CmsHtml 
                  contentKey="about_team_member2_name" 
                  fallback="Maria Ionescu" 
                />
              </h3>
              <p className="text-primary font-medium mb-4">
                <CmsHtml 
                  contentKey="about_team_member2_position" 
                  fallback="Director Relații cu Organizatorii" 
                />
              </p>
              <p className="text-neutral-600">
                <CmsHtml 
                  contentKey="about_team_member2_bio" 
                  fallback="Specializată în colaborarea cu mănăstiri și operatori de turism religios pentru a asigura cele mai bune experiențe." 
                />
              </p>
            </div>
            <div className="text-center">
              <div className="w-40 h-40 rounded-full overflow-hidden mx-auto mb-6">
                <CmsImage 
                  contentKey="about_team_member3_image" 
                  fallbackSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                  alt="Membru echipa"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold mb-2">
                <CmsHtml 
                  contentKey="about_team_member3_name" 
                  fallback="Nicolae Stancu" 
                />
              </h3>
              <p className="text-primary font-medium mb-4">
                <CmsHtml 
                  contentKey="about_team_member3_position" 
                  fallback="Specialist în Istorie Bisericească" 
                />
              </p>
              <p className="text-neutral-600">
                <CmsHtml 
                  contentKey="about_team_member3_bio" 
                  fallback="Doctor în teologie cu expertiză în locurile sfinte ortodoxe, oferind context istoric și spiritual pentru pelerinaje." 
                />
              </p>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div>
          <h2 className="text-3xl font-bold mb-10 text-center">
            <CmsHtml 
              contentKey="about_testimonials_title" 
              fallback="Ce Spun Pelerinii" 
            />
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-6">
                <div className="text-yellow-500 flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-neutral-600 italic mb-6">
                <CmsHtml 
                  contentKey="about_testimonial1_content" 
                  fallback="Platforma Doxa mi-a oferit oportunitatea de a găsi pelerinaje organizate de ghizi spirituali excepționali. Experiența la Muntele Athos a fost transformatoare și organizată impecabil." 
                />
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <CmsImage 
                    contentKey="about_testimonial1_image" 
                    fallbackSrc="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80"
                    alt="Pelerin"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold">
                    <CmsHtml 
                      contentKey="about_testimonial1_name" 
                      fallback="Ion Dumitrescu" 
                    />
                  </h4>
                  <p className="text-sm text-neutral-500">
                    <CmsHtml 
                      contentKey="about_testimonial1_location" 
                      fallback="București" 
                    />
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-6">
                <div className="text-yellow-500 flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-neutral-600 italic mb-6">
                <CmsHtml 
                  contentKey="about_testimonial2_content" 
                  fallback="Apreciez transparența și atenția acordată detaliilor spirituale ale fiecărui pelerinaj. Prin Doxa am reușit să vizitez Țara Sfântă și să am parte de o experiență autentică, departe de turismul comercial." 
                />
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <CmsImage 
                    contentKey="about_testimonial2_image" 
                    fallbackSrc="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80"
                    alt="Pelerin"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold">
                    <CmsHtml 
                      contentKey="about_testimonial2_name" 
                      fallback="Elena Munteanu" 
                    />
                  </h4>
                  <p className="text-sm text-neutral-500">
                    <CmsHtml 
                      contentKey="about_testimonial2_location" 
                      fallback="Cluj-Napoca" 
                    />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componenta pentru imagini CMS
function CmsImage({ contentKey, fallbackSrc, alt, className = '' }) {
  return (
    <img 
      src={fallbackSrc}
      alt={alt}
      className={className}
    />
  );
}