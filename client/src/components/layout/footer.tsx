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
              <a href="#" className="text-neutral-400 hover:text-white transition duration-300">
                <CmsImage contentKey="footer_social_facebook" fallbackSrc="/images/icons/facebook.svg" alt="Facebook" className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition duration-300">
                <CmsImage contentKey="footer_social_instagram" fallbackSrc="/images/icons/instagram.svg" alt="Instagram" className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition duration-300">
                <CmsImage contentKey="footer_social_youtube" fallbackSrc="/images/icons/youtube.svg" alt="YouTube" className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6">
              <CmsText contentKey="footer_quicklinks_title" fallback="Linkuri Rapide" />
            </h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-neutral-400 hover:text-white transition duration-300">
                <CmsText contentKey="footer_link_home" fallback="Acasă" />
              </Link></li>
              <li><Link href="/pilgrimages" className="text-neutral-400 hover:text-white transition duration-300">
                <CmsText contentKey="footer_link_pilgrimages" fallback="Pelerinaje" />
              </Link></li>
              <li><Link href="/about" className="text-neutral-400 hover:text-white transition duration-300">
                <CmsText contentKey="footer_link_about" fallback="Despre Noi" />
              </Link></li>
              <li><Link href="/contact" className="text-neutral-400 hover:text-white transition duration-300">
                <CmsText contentKey="footer_link_contact" fallback="Contact" />
              </Link></li>
              <li><Link href="/auth" className="text-neutral-400 hover:text-white transition duration-300">
                <CmsText contentKey="footer_link_auth" fallback="Autentificare" />
              </Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6">
              <CmsText contentKey="footer_destinations_title" fallback="Destinații Populare" />
            </h4>
            <ul className="space-y-3">
              <li><Link href="/pilgrimages?location=Israel" className="text-neutral-400 hover:text-white transition duration-300">
                <CmsText contentKey="footer_destination_israel" fallback="Israel și Palestina" />
              </Link></li>
              <li><Link href="/pilgrimages?location=Grecia" className="text-neutral-400 hover:text-white transition duration-300">
                <CmsText contentKey="footer_destination_athos" fallback="Muntele Athos" />
              </Link></li>
              <li><Link href="/pilgrimages?location=România" className="text-neutral-400 hover:text-white transition duration-300">
                <CmsText contentKey="footer_destination_moldova" fallback="Mănăstirile din Moldova" />
              </Link></li>
              <li><Link href="/pilgrimages?location=Vatican" className="text-neutral-400 hover:text-white transition duration-300">
                <CmsText contentKey="footer_destination_vatican" fallback="Vatican" />
              </Link></li>
              <li><Link href="/pilgrimages?location=Franța" className="text-neutral-400 hover:text-white transition duration-300">
                <CmsText contentKey="footer_destination_lourdes" fallback="Lourdes" />
              </Link></li>
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
            <Link href="/terms" className="text-neutral-400 hover:text-white text-sm transition duration-300">
              <CmsText contentKey="footer_terms" fallback="Termeni și Condiții" />
            </Link>
            <Link href="/privacy" className="text-neutral-400 hover:text-white text-sm transition duration-300">
              <CmsText contentKey="footer_privacy" fallback="Politica de Confidențialitate" />
            </Link>
            <Link href="/cookies" className="text-neutral-400 hover:text-white text-sm transition duration-300">
              <CmsText contentKey="footer_cookies" fallback="Cookies" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
