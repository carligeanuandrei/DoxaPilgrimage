import { Link } from "wouter";
import { CmsText, CmsHtml, CmsImage } from "@/components/shared/cms-content";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-6">
              <span className="text-white font-heading text-2xl font-bold">
                <CmsText contentKey="footer_brand_name" fallback="Doxa" />
              </span>
              <span className="text-yellow-500 ml-1">
                <CmsImage contentKey="footer_brand_icon" fallbackSrc="/images/icons/icon-cross.svg" alt="Logo icon" className="h-5 w-5" />
              </span>
            </div>
            <div className="text-neutral-400 mb-6">
              <CmsText 
                contentKey="footer_description" 
                fallback="Platformă de pelerinaje care conectează pelerini cu organizatori de încredere pentru experiențe spirituale autentice."
                className="text-neutral-400"
              />
            </div>
            <div className="flex space-x-4">
              <a href="#" onClick={(e) => { e.preventDefault(); window.open(document.querySelector('[data-key="footer_social_facebook_url"]')?.textContent || 'https://facebook.com', '_blank'); }} className="text-neutral-400 hover:text-white transition duration-300">
                <CmsText contentKey="footer_social_facebook_url" fallback="https://facebook.com" className="hidden" />
                <CmsImage contentKey="footer_social_facebook" fallbackSrc="/images/icons/facebook.svg" alt="Facebook" className="h-5 w-5" />
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); window.open(document.querySelector('[data-key="footer_social_instagram_url"]')?.textContent || 'https://instagram.com', '_blank'); }} className="text-neutral-400 hover:text-white transition duration-300">
                <CmsText contentKey="footer_social_instagram_url" fallback="https://instagram.com" className="hidden" />
                <CmsImage contentKey="footer_social_instagram" fallbackSrc="/images/icons/instagram.svg" alt="Instagram" className="h-5 w-5" />
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); window.open(document.querySelector('[data-key="footer_social_youtube_url"]')?.textContent || 'https://youtube.com', '_blank'); }} className="text-neutral-400 hover:text-white transition duration-300">
                <CmsText contentKey="footer_social_youtube_url" fallback="https://youtube.com" className="hidden" />
                <CmsImage contentKey="footer_social_youtube" fallbackSrc="/images/icons/youtube.svg" alt="YouTube" className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6">
              <CmsText contentKey="footer_quicklinks_title" fallback="Linkuri Rapide" />
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#" onClick={(e) => { 
                  e.preventDefault(); 
                  const href = document.querySelector('[data-key="footer_link_home_url"]')?.textContent || '/';
                  window.location.href = href;
                }} className="text-neutral-400 hover:text-white transition duration-300">
                  <CmsText contentKey="footer_link_home_url" fallback="/" className="hidden" />
                  <CmsText contentKey="footer_link_home" fallback="Acasă" />
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => { 
                  e.preventDefault(); 
                  const href = document.querySelector('[data-key="footer_link_pilgrimages_url"]')?.textContent || '/pilgrimages';
                  window.location.href = href;
                }} className="text-neutral-400 hover:text-white transition duration-300">
                  <CmsText contentKey="footer_link_pilgrimages_url" fallback="/pilgrimages" className="hidden" />
                  <CmsText contentKey="footer_link_pilgrimages" fallback="Pelerinaje" />
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => { 
                  e.preventDefault(); 
                  const href = document.querySelector('[data-key="footer_link_about_url"]')?.textContent || '/about';
                  window.location.href = href;
                }} className="text-neutral-400 hover:text-white transition duration-300">
                  <CmsText contentKey="footer_link_about_url" fallback="/about" className="hidden" />
                  <CmsText contentKey="footer_link_about" fallback="Despre Noi" />
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => { 
                  e.preventDefault(); 
                  const href = document.querySelector('[data-key="footer_link_contact_url"]')?.textContent || '/contact';
                  window.location.href = href;
                }} className="text-neutral-400 hover:text-white transition duration-300">
                  <CmsText contentKey="footer_link_contact_url" fallback="/contact" className="hidden" />
                  <CmsText contentKey="footer_link_contact" fallback="Contact" />
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => { 
                  e.preventDefault(); 
                  const href = document.querySelector('[data-key="footer_link_auth_url"]')?.textContent || '/auth';
                  window.location.href = href;
                }} className="text-neutral-400 hover:text-white transition duration-300">
                  <CmsText contentKey="footer_link_auth_url" fallback="/auth" className="hidden" />
                  <CmsText contentKey="footer_link_auth" fallback="Autentificare" />
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6">
              <CmsText contentKey="footer_destinations_title" fallback="Destinații Populare" />
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#" onClick={(e) => { 
                  e.preventDefault(); 
                  const href = document.querySelector('[data-key="footer_destination_israel_url"]')?.textContent || '/pilgrimages?location=Israel';
                  window.location.href = href;
                }} className="text-neutral-400 hover:text-white transition duration-300">
                  <CmsText contentKey="footer_destination_israel_url" fallback="/pilgrimages?location=Israel" className="hidden" />
                  <CmsText contentKey="footer_destination_israel" fallback="Israel și Palestina" />
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => { 
                  e.preventDefault(); 
                  const href = document.querySelector('[data-key="footer_destination_athos_url"]')?.textContent || '/pilgrimages?location=Grecia';
                  window.location.href = href;
                }} className="text-neutral-400 hover:text-white transition duration-300">
                  <CmsText contentKey="footer_destination_athos_url" fallback="/pilgrimages?location=Grecia" className="hidden" />
                  <CmsText contentKey="footer_destination_athos" fallback="Muntele Athos" />
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => { 
                  e.preventDefault(); 
                  const href = document.querySelector('[data-key="footer_destination_moldova_url"]')?.textContent || '/pilgrimages?location=România';
                  window.location.href = href;
                }} className="text-neutral-400 hover:text-white transition duration-300">
                  <CmsText contentKey="footer_destination_moldova_url" fallback="/pilgrimages?location=România" className="hidden" />
                  <CmsText contentKey="footer_destination_moldova" fallback="Mănăstirile din Moldova" />
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => { 
                  e.preventDefault(); 
                  const href = document.querySelector('[data-key="footer_destination_vatican_url"]')?.textContent || '/pilgrimages?location=Vatican';
                  window.location.href = href;
                }} className="text-neutral-400 hover:text-white transition duration-300">
                  <CmsText contentKey="footer_destination_vatican_url" fallback="/pilgrimages?location=Vatican" className="hidden" />
                  <CmsText contentKey="footer_destination_vatican" fallback="Vatican" />
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => { 
                  e.preventDefault(); 
                  const href = document.querySelector('[data-key="footer_destination_lourdes_url"]')?.textContent || '/pilgrimages?location=Franța';
                  window.location.href = href;
                }} className="text-neutral-400 hover:text-white transition duration-300">
                  <CmsText contentKey="footer_destination_lourdes_url" fallback="/pilgrimages?location=Franța" className="hidden" />
                  <CmsText contentKey="footer_destination_lourdes" fallback="Lourdes" />
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6">
              <CmsText contentKey="footer_contact_title" fallback="Contact" />
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CmsImage contentKey="footer_contact_address_icon" fallbackSrc="/images/icons/map-pin.svg" alt="Address" className="h-5 w-5 mr-3 text-neutral-400 mt-1" />
                <span className="text-neutral-400">
                  <CmsText contentKey="footer_contact_address" fallback="Str. Biserica Amzei 19, București, România" />
                </span>
              </li>
              <li className="flex items-center">
                <CmsImage contentKey="footer_contact_phone_icon" fallbackSrc="/images/icons/phone.svg" alt="Phone" className="h-5 w-5 mr-3 text-neutral-400" />
                <span className="text-neutral-400">
                  <CmsText contentKey="footer_contact_phone" fallback="+40 721 234 567" />
                </span>
              </li>
              <li className="flex items-center">
                <CmsImage contentKey="footer_contact_email_icon" fallbackSrc="/images/icons/mail.svg" alt="Email" className="h-5 w-5 mr-3 text-neutral-400" />
                <span className="text-neutral-400">
                  <CmsText contentKey="footer_contact_email" fallback="contact@doxa-pelerinaje.ro" />
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} <CmsText contentKey="footer_copyright" fallback="Doxa Pelerinaje. Toate drepturile rezervate." />
          </p>
          
          <div className="flex space-x-6">
            <a href="#" onClick={(e) => { 
              e.preventDefault(); 
              const href = document.querySelector('[data-key="footer_terms_url"]')?.textContent || '/termeni-si-conditii';
              window.location.href = href;
            }} className="text-neutral-400 hover:text-white text-sm transition duration-300">
              <CmsText contentKey="footer_terms_url" fallback="/termeni-si-conditii" className="hidden" />
              <CmsText contentKey="footer_terms" fallback="Termeni și Condiții" />
            </a>
            <a href="#" onClick={(e) => { 
              e.preventDefault(); 
              const href = document.querySelector('[data-key="footer_privacy_url"]')?.textContent || '/politica-de-confidentialitate';
              window.location.href = href;
            }} className="text-neutral-400 hover:text-white text-sm transition duration-300">
              <CmsText contentKey="footer_privacy_url" fallback="/politica-de-confidentialitate" className="hidden" />
              <CmsText contentKey="footer_privacy" fallback="Politica de Confidențialitate" />
            </a>
            <a href="#" onClick={(e) => { 
              e.preventDefault(); 
              const href = document.querySelector('[data-key="footer_cookies_url"]')?.textContent || '/cookies';
              window.location.href = href;
            }} className="text-neutral-400 hover:text-white text-sm transition duration-300">
              <CmsText contentKey="footer_cookies_url" fallback="/cookies" className="hidden" />
              <CmsText contentKey="footer_cookies" fallback="Cookies" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
