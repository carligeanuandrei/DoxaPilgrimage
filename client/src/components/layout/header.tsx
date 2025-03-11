import { useAuth } from '@/hooks/use-auth';
import { CmsText, CmsImage } from '@/components/shared/cms-content';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, Home, Map, Info, Phone, User as UserIcon, Shield } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const isMobile = useIsMobile();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <CmsImage 
                contentKey="footer_brand_icon" 
                fallbackSrc="/logo.png" 
                alt="Doxa Logo" 
                className="h-8 w-8" 
              />
              <CmsText 
                contentKey="footer_brand_name" 
                fallback="Doxa" 
                className="text-xl font-bold tracking-tight" 
              />
            </div>
          </Link>
          
          {/* Main navigation - desktop only */}
          {!isMobile && (
            <nav className="flex items-center gap-6 text-sm ml-8">
              <Link href="/">
                <span className="font-medium transition-colors hover:text-primary cursor-pointer">
                  <CmsText contentKey="footer_link_home" fallback="Acasă" />
                </span>
              </Link>
              <Link href="/pilgrimages">
                <span className="font-medium transition-colors hover:text-primary cursor-pointer">
                  <CmsText contentKey="footer_link_pilgrimages" fallback="Pelerinaje" />
                </span>
              </Link>
              <Link href="/orthodox-calendar">
                <span className="font-medium transition-colors hover:text-primary cursor-pointer">
                  Calendar Ortodox
                </span>
              </Link>
              <Link href="/about">
                <span className="font-medium transition-colors hover:text-primary cursor-pointer">
                  <CmsText contentKey="footer_link_about" fallback="Despre noi" />
                </span>
              </Link>
              <Link href="/contact">
                <span className="font-medium transition-colors hover:text-primary cursor-pointer">
                  <CmsText contentKey="footer_link_contact" fallback="Contact" />
                </span>
              </Link>
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profileImage || ''} alt={user.firstName} />
                    <AvatarFallback>{user.firstName?.charAt(0) || user.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </DropdownMenuItem>
                </Link>
                
                {(user.role === 'operator' || user.role === 'monastery') && (
                  <Link href="/organizer/dashboard">
                    <DropdownMenuItem className="cursor-pointer">
                      <Map className="mr-2 h-4 w-4" />
                      <span>Pelerinajele mele</span>
                    </DropdownMenuItem>
                  </Link>
                )}
                
                {user.role === 'admin' && (
                  <Link href="/admin/pilgrimages">
                    <DropdownMenuItem className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Administrare</span>
                    </DropdownMenuItem>
                  </Link>
                )}
                
                <Link href="/edit-profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Setări</span>
                  </DropdownMenuItem>
                </Link>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Deconectare</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button variant="default">
                <CmsText contentKey="footer_link_auth" fallback="Autentificare" />
              </Button>
            </Link>
          )}
          
          {/* Mobile menu button */}
          {isMobile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className="sr-only">Meniu navigare</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <Link href="/">
                  <DropdownMenuItem className="cursor-pointer">
                    <Home className="mr-2 h-4 w-4" />
                    <CmsText contentKey="footer_link_home" fallback="Acasă" />
                  </DropdownMenuItem>
                </Link>
                <Link href="/pilgrimages">
                  <DropdownMenuItem className="cursor-pointer">
                    <Map className="mr-2 h-4 w-4" />
                    <CmsText contentKey="footer_link_pilgrimages" fallback="Pelerinaje" />
                  </DropdownMenuItem>
                </Link>
                <Link href="/orthodox-calendar">
                  <DropdownMenuItem className="cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Calendar Ortodox
                  </DropdownMenuItem>
                </Link>
                <Link href="/about">
                  <DropdownMenuItem className="cursor-pointer">
                    <Info className="mr-2 h-4 w-4" />
                    <CmsText contentKey="footer_link_about" fallback="Despre noi" />
                  </DropdownMenuItem>
                </Link>
                <Link href="/contact">
                  <DropdownMenuItem className="cursor-pointer">
                    <Phone className="mr-2 h-4 w-4" />
                    <CmsText contentKey="footer_link_contact" fallback="Contact" />
                  </DropdownMenuItem>
                </Link>
                
                {!user && (
                  <>
                    <DropdownMenuSeparator />
                    <Link href="/auth">
                      <DropdownMenuItem className="cursor-pointer">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <CmsText contentKey="footer_link_auth" fallback="Autentificare" />
                      </DropdownMenuItem>
                    </Link>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}