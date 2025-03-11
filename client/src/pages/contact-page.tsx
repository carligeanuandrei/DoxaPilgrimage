import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { CmsHtml, CmsText } from '@/components/shared/cms-display';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DynamicPage } from '@/components/builder/dynamic-page';

// Definim schema de validare pentru formular
const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Numele trebuie să aibă cel puțin 2 caractere' }),
  email: z.string().email({ message: 'Adresa de email trebuie să fie validă' }),
  subject: z.string().min(3, { message: 'Subiectul trebuie să aibă cel puțin 3 caractere' }),
  message: z.string().min(10, { message: 'Mesajul trebuie să aibă cel puțin 10 caractere' }),
  category: z.string(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Adăugăm componenta de pagină dinamică - va încărca pagina de tip "contact" dacă există

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      category: 'general',
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      const res = await apiRequest('POST', '/api/contact', data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Mesaj trimis',
        description: 'Vom reveni cu un răspuns în cel mai scurt timp posibil.',
        variant: 'default',
      });
      form.reset();
      setFormSubmitted(true);
    },
    onError: (error: Error) => {
      toast({
        title: 'Eroare',
        description: error.message || 'A apărut o eroare la trimiterea mesajului. Vă rugăm să încercați din nou.',
        variant: 'destructive',
      });
    },
  });

  function onSubmit(data: ContactFormValues) {
    contactMutation.mutate(data);
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Helmet>
        <title>Contact | Doxa Pelerinaje</title>
        <meta name="description" content="Contactați-ne pentru informații despre pelerinaje, colaborări sau suport. Echipa Doxa este aici pentru a vă ajuta cu orice întrebare legată de călătoriile spirituale." />
      </Helmet>

      <div className="container mx-auto px-4 py-16">
        {/* Hero section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <CmsText contentKey="contact_page_title" fallback="Contactați-ne" />
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            <CmsText contentKey="contact_page_subtitle" fallback="Suntem aici pentru a vă răspunde la întrebări și pentru a vă ajuta să găsiți pelerinajul perfect pentru nevoile dumneavoastră spirituale." />
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Contact info */}
          <div className="col-span-1">
            <div className="bg-white p-8 rounded-lg shadow-md h-full">
              <h2 className="text-2xl font-bold mb-6">
                <CmsText contentKey="contact_info_title" fallback="Informații de Contact" />
              </h2>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Email</h3>
                    <p className="text-neutral-600">
                      <CmsText contentKey="contact_email" fallback="contact@doxa-pelerinaje.ro" />
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary/10 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Telefon</h3>
                    <p className="text-neutral-600">
                      <CmsText contentKey="contact_office_phone" fallback="+40 721 234 567" />
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary/10 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Adresă</h3>
                    <p className="text-neutral-600">
                      <CmsText contentKey="contact_office_address" fallback="Str. Biserica Amzei 19, București, România" />
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary/10 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Program</h3>
                    <p className="text-neutral-600">
                      <CmsText contentKey="contact_hours" fallback="Luni - Vineri: 9:00 - 18:00" />
                    </p>
                    <p className="text-neutral-600">
                      <CmsText contentKey="contact_hours_weekend" fallback="Sâmbătă: 10:00 - 14:00" />
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold mt-8 mb-4">
                <CmsText contentKey="contact_social_title" fallback="Urmăriți-ne" />
              </h3>
              <div className="flex space-x-4">
                <a href="#" className="bg-primary/10 p-3 rounded-full hover:bg-primary/20 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </a>
                <a href="#" className="bg-primary/10 p-3 rounded-full hover:bg-primary/20 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="#" className="bg-primary/10 p-3 rounded-full hover:bg-primary/20 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="md:col-span-2">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-6">
                <CmsText contentKey="contact_form_title" fallback="Trimiteți-ne un Mesaj" />
              </h2>

              {formSubmitted ? (
                <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-6 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-bold mb-2">
                    <CmsText contentKey="contact_success_title" fallback="Mulțumim pentru mesaj!" />
                  </h3>
                  <p className="mb-4">
                    <CmsText contentKey="contact_success_message" fallback="Vom reveni cu un răspuns în cel mai scurt timp posibil." />
                  </p>
                  <Button onClick={() => setFormSubmitted(false)}>
                    <CmsText contentKey="contact_new_message_button" fallback="Trimite un nou mesaj" />
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nume</FormLabel>
                            <FormControl>
                              <Input placeholder="Introduceți numele complet" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="numele@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categorie</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selectați o categorie" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="general">Informații Generale</SelectItem>
                              <SelectItem value="booking">Rezervări</SelectItem>
                              <SelectItem value="support">Suport</SelectItem>
                              <SelectItem value="partnership">Parteneriate</SelectItem>
                              <SelectItem value="feedback">Feedback</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subiect</FormLabel>
                          <FormControl>
                            <Input placeholder="Introduceți subiectul mesajului" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mesaj</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Scrieți mesajul dumneavoastră aici..."
                              className="min-h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={contactMutation.isPending}>
                      {contactMutation.isPending ? 'Se trimite...' : 'Trimite mesajul'}
                    </Button>
                  </form>
                </Form>
              )}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">
            <CmsText contentKey="contact_map_title" fallback="Locația Noastră" />
          </h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-200 w-full">
              <CmsHtml 
                contentKey="contact_map_embed" 
                fallback={`
                <div class="h-full w-full flex items-center justify-center bg-neutral-200">
                  <p class="text-neutral-500 text-center">Aici va fi afișată harta cu locația biroului nostru</p>
                </div>
                `}
                refreshInterval={5000}
              />
            </div>
            <div className="mt-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <h3 className="font-semibold mb-2">
                <CmsText contentKey="contact_directions_title" fallback="Indicații de Acces" refreshInterval={5000} />
              </h3>
              <p className="text-neutral-600">
                <CmsText contentKey="contact_directions_content" fallback="Pentru a ajunge la noi, puteți folosi transportul public - stația de metrou Biserica Amzei se află la 5 minute de mers pe jos. Este disponibilă și parcarea publică din zonă." refreshInterval={5000} />
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">
            <CmsText contentKey="contact_faq_title" fallback="Întrebări Frecvente" refreshInterval={5000} />
          </h2>
          
          <div className="mb-6 flex justify-end">
            <Button 
              variant="outline" 
              className="text-sm flex items-center gap-1"
              onClick={() => window.open('/admin/cms?filter=contact_faq', '_blank')}
            >
              <span className="text-primary">Administrare FAQ</span>
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <CmsHtml
              contentKey="contact_faq_all"
              fallback={`
                <div class="bg-white p-6 rounded-lg shadow-md">
                  <h3 class="font-bold text-lg mb-3">Cum pot rezerva un pelerinaj?</h3>
                  <p class="text-neutral-600">Pentru a rezerva un pelerinaj, trebuie să vă creați un cont pe platformă, să selectați pelerinajul dorit și să urmați pașii de rezervare. Puteți plăti online sau solicita detalii suplimentare înainte de confirmare.</p>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-md">
                  <h3 class="font-bold text-lg mb-3">Care sunt modalitățile de plată acceptate?</h3>
                  <p class="text-neutral-600">Acceptăm plăți cu cardul (Visa, Mastercard), transfer bancar și în anumite cazuri, plata în numerar la sediul nostru. Toate plățile online sunt securizate prin protocol SSL.</p>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-md">
                  <h3 class="font-bold text-lg mb-3">Pot anula sau reprograma un pelerinaj?</h3>
                  <p class="text-neutral-600">Da, puteți anula sau reprograma în funcție de termenii și condițiile specifice fiecărui pelerinaj. De obicei, cu 30 de zile înainte de plecare rambursarea este integrală, iar după această perioadă se pot aplica penalizări.</p>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-md">
                  <h3 class="font-bold text-lg mb-3">Cum pot deveni organizator de pelerinaje pe platformă?</h3>
                  <p class="text-neutral-600">Pentru a deveni organizator, completați formularul de parteneriat din secțiunea Contact și veți fi contactat de un reprezentant pentru verificarea documentelor și detalii despre procesul de colaborare.</p>
                </div>
              `}
              refreshInterval={5000}
            />
          </div>
        </div>
      </div>
    </div>
  );
}