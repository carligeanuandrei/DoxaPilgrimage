import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, LogOut, Calendar, Church, Settings, BarChart3, LayoutTemplate, Edit } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleName = (role: string) => {
    const roleMap: Record<string, string> = {
      'admin': 'Administrator',
      'pilgrim': 'Pelerin',
      'operator': 'Operator de Turism',
      'monastery': 'Administrator Mănăstire'
    };
    return roleMap[role] || role;
  };
  
  const isActiveLink = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  // Verifică dacă URL-ul curent este o pagină editabilă
  const isEditablePage = () => {
    // Consideră toate paginile care nu sunt în rute specifice ca fiind potențial editabile
    const nonEditableRoutes = [
      '/auth', 
      '/profile', 
      '/edit-profile',
      '/admin',
      '/organizer'
    ];
    
    return !nonEditableRoutes.some(route => location.startsWith(route)) && 
           location !== '/pilgrimages' &&
           location !== '/orthodox-calendar' &&
           !location.startsWith('/pilgrimages/');
  };

  // Activează modul de editare pentru pagina curentă
  const activateEditMode = () => {
    // Setează un flag în localStorage pentru a indica faptul că modul de editare este activat
    localStorage.setItem('editModeEnabled', 'true');
    // Reîncarcă pagina pentru ca modificarea să fie preluată
    window.location.reload();
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        {/* Buton de editare pagină pentru admin */}
        {user?.role === 'admin' && isEditablePage() && (
          <div className="absolute top-2 right-4 z-50">
            <Button 
              onClick={activateEditMode}
              size="sm" 
              variant="outline" 
              className="flex items-center gap-1 bg-white text-primary hover:bg-primary-100 border-primary"
            >
              <Edit className="h-4 w-4" />
              Editează pagina
            </Button>
          </div>
        )}
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img 
              src="/images/logo.svg" 
              alt="Doxa" 
              className="h-10" 
            />
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`font-medium ${isActiveLink('/') ? 'text-primary' : 'text-neutral-700 hover:text-primary'}`}>
              Acasă
            </Link>
            <Link href="/pilgrimages" className={`font-medium ${isActiveLink('/pilgrimages') ? 'text-primary' : 'text-neutral-700 hover:text-primary'}`}>
              Pelerinaje
            </Link>
            <Link href="/orthodox-calendar" className={`font-medium flex items-center ${isActiveLink('/orthodox-calendar') ? 'text-primary' : 'text-neutral-700 hover:text-primary'}`}>
              <Calendar className="h-4 w-4 mr-1" />
              Calendar Ortodox
            </Link>
            <Link href="/about" className={`font-medium ${isActiveLink('/about') ? 'text-primary' : 'text-neutral-700 hover:text-primary'}`}>
              Despre Noi
            </Link>
            <Link href="/contact" className={`font-medium ${isActiveLink('/contact') ? 'text-primary' : 'text-neutral-700 hover:text-primary'}`}>
              Contact
            </Link>
          </nav>

          {/* Auth buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full h-8 w-8 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImage || '/images/user/profile-placeholder.svg'} alt={`${user.firstName} ${user.lastName}`} />
                      <AvatarFallback className="bg-primary text-white">
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="font-medium">
                    {user.firstName} {user.lastName}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-sm text-muted-foreground">
                    {getRoleName(user.role)}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  {/* Link-uri specifice pentru admin */}
                  {user.role === "admin" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/cms" className="cursor-pointer w-full">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Gestiune CMS</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/builder" className="cursor-pointer w-full">
                          <LayoutTemplate className="mr-2 h-4 w-4" />
                          <span>Builder Pagini</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/users" className="cursor-pointer w-full">
                          <User className="mr-2 h-4 w-4" />
                          <span>Gestiune Utilizatori</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/pilgrimages" className="cursor-pointer w-full">
                          <Church className="mr-2 h-4 w-4" />
                          <span>Gestiune Pelerinaje</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/organizer-stats" className="cursor-pointer w-full">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          <span>Statistici Organizatori</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {/* Link pentru organizatori */}
                  {(user.role === "operator" || user.role === "monastery") && (
                    <DropdownMenuItem asChild>
                      <Link href="/organizer/dashboard" className="cursor-pointer w-full">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Panou administrare</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Deconectare</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth" className="text-primary hover:text-primary-dark font-medium">
                  Autentificare
                </Link>
                <Link href="/auth?tab=register" className="bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2 rounded transition duration-300">
                  Înregistrare
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            type="button" 
            className="md:hidden text-neutral-700 hover:text-primary"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white py-4 border-t border-neutral-200">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className={`px-4 font-medium ${isActiveLink('/') ? 'text-primary' : 'text-neutral-700'}`} onClick={closeMobileMenu}>
                Acasă
              </Link>
              <Link href="/pilgrimages" className={`px-4 font-medium ${isActiveLink('/pilgrimages') ? 'text-primary' : 'text-neutral-700'}`} onClick={closeMobileMenu}>
                Pelerinaje
              </Link>
              <Link href="/orthodox-calendar" className={`px-4 font-medium flex items-center ${isActiveLink('/orthodox-calendar') ? 'text-primary' : 'text-neutral-700'}`} onClick={closeMobileMenu}>
                <Calendar className="h-4 w-4 mr-1" />
                Calendar Ortodox
              </Link>
              <Link href="/about" className={`px-4 font-medium ${isActiveLink('/about') ? 'text-primary' : 'text-neutral-700'}`} onClick={closeMobileMenu}>
                Despre Noi
              </Link>
              <Link href="/contact" className={`px-4 font-medium ${isActiveLink('/contact') ? 'text-primary' : 'text-neutral-700'}`} onClick={closeMobileMenu}>
                Contact
              </Link>
            </nav>
            <div className="mt-4 flex flex-col space-y-2 px-4">
              {user ? (
                <>
                  <div className="mb-2 pb-2 border-b border-neutral-200">
                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-neutral-500">{getRoleName(user.role)}</div>
                  </div>
                  <Link href="/profile" className="text-primary hover:text-primary-dark font-medium" onClick={closeMobileMenu}>
                    <User className="inline mr-2 h-4 w-4" />
                    Profilul meu
                  </Link>
                  
                  {/* Linkuri pentru admin în meniul mobil */}
                  {user.role === "admin" && (
                    <>
                      <Link href="/admin/cms" className="text-primary hover:text-primary-dark font-medium" onClick={closeMobileMenu}>
                        <Settings className="inline mr-2 h-4 w-4" />
                        Gestiune CMS
                      </Link>
                      <Link href="/admin/builder" className="text-primary hover:text-primary-dark font-medium" onClick={closeMobileMenu}>
                        <LayoutTemplate className="inline mr-2 h-4 w-4" />
                        Builder Pagini
                      </Link>
                      <Link href="/admin/users" className="text-primary hover:text-primary-dark font-medium" onClick={closeMobileMenu}>
                        <User className="inline mr-2 h-4 w-4" />
                        Gestiune Utilizatori
                      </Link>
                      <Link href="/admin/pilgrimages" className="text-primary hover:text-primary-dark font-medium" onClick={closeMobileMenu}>
                        <Church className="inline mr-2 h-4 w-4" />
                        Gestiune Pelerinaje
                      </Link>
                      <Link href="/admin/organizer-stats" className="text-primary hover:text-primary-dark font-medium" onClick={closeMobileMenu}>
                        <BarChart3 className="inline mr-2 h-4 w-4" />
                        Statistici Organizatori
                      </Link>
                    </>
                  )}
                  
                  {/* Link pentru organizatori în meniul mobil */}
                  {(user.role === "operator" || user.role === "monastery") && (
                    <Link href="/organizer/dashboard" className="text-primary hover:text-primary-dark font-medium" onClick={closeMobileMenu}>
                      <Settings className="inline mr-2 h-4 w-4" />
                      Panou administrare
                    </Link>
                  )}
                  
                  <Button variant="outline" onClick={() => { handleLogout(); closeMobileMenu(); }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Deconectare
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth" className="text-primary hover:text-primary-dark font-medium" onClick={closeMobileMenu}>
                    Autentificare
                  </Link>
                  <Link href="/auth?tab=register" className="bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2 rounded transition duration-300 text-center" onClick={closeMobileMenu}>
                    Înregistrare
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
