import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Testimonials() {
  return (
    <section className="py-12 md:py-16 bg-primary">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-white text-center mb-12">Ce Spun Pelerinii</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Testimonial 1 */}
          <Card className="bg-white rounded-lg p-6 shadow-md">
            <CardContent className="p-0">
              <div className="flex items-center mb-4">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src="https://randomuser.me/api/portraits/women/44.jpg" alt="Elena Popescu" />
                  <AvatarFallback>EP</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-neutral-900">Elena Popescu</h4>
                  <p className="text-sm text-neutral-500">Pelerinaj în Țara Sfântă</p>
                </div>
              </div>
              <div className="text-yellow-400 mb-3 flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-neutral-600">
                "O experiență transformatoare care mi-a întărit credința. Organizarea a fost impecabilă, iar ghidul nostru spiritual, Părintele Andrei, a fost extraordinar. Recomand cu căldură tuturor!"
              </p>
            </CardContent>
          </Card>
          
          {/* Testimonial 2 */}
          <Card className="bg-white rounded-lg p-6 shadow-md">
            <CardContent className="p-0">
              <div className="flex items-center mb-4">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" alt="Mihai Dumitrescu" />
                  <AvatarFallback>MD</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-neutral-900">Mihai Dumitrescu</h4>
                  <p className="text-sm text-neutral-500">Muntele Athos</p>
                </div>
              </div>
              <div className="text-yellow-400 mb-3 flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-neutral-600">
                "Am găsit pe Doxa exact pelerinajul pe care îl căutam de mult. Totul a decurs perfect, de la rezervare până la întoarcerea acasă. Am avut parte de o călătorie spirituală profundă."
              </p>
            </CardContent>
          </Card>
          
          {/* Testimonial 3 */}
          <Card className="bg-white rounded-lg p-6 shadow-md">
            <CardContent className="p-0">
              <div className="flex items-center mb-4">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src="https://randomuser.me/api/portraits/women/68.jpg" alt="Ana Ionescu" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-neutral-900">Ana Ionescu</h4>
                  <p className="text-sm text-neutral-500">Mănăstirile din Bucovina</p>
                </div>
              </div>
              <div className="text-yellow-400 mb-3 flex">
                {[...Array(4)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clipPath="url(#half-star)" />
                  <defs>
                    <clipPath id="half-star">
                      <rect x="0" y="0" width="10" height="20" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <p className="text-neutral-600">
                "Platforma este foarte ușor de folosit, iar comunicarea cu organizatorii a fost excelentă. Pelerinajul a fost mai frumos decât mă așteptam, iar prețul a fost foarte corect pentru serviciile oferite."
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
