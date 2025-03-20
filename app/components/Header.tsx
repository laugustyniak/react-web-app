import { useNavigate, useLocation } from 'react-router';
import { Button } from '~/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '~/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import { cn } from '~/lib/utils';
import { ThemeToggle } from './ui/theme-toggle';
import { useState, useCallback, memo } from 'react';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check if the current path matches the given path
  const isActive = useCallback(
    (path: string) => {
      return location.pathname === path;
    },
    [location.pathname]
  );

  // Check if the current path is an account page
  const isAccountPage = useCallback(() => {
    return location.pathname.startsWith('/account/');
  }, [location.pathname]);

  const handleSignIn = useCallback(() => {
    navigate('/sign-in');
  }, [navigate]);

  const handleSignUp = useCallback(() => {
    navigate('/sign-up');
  }, [navigate]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut('/');
    } catch (error) {
      console.error('Failed to sign out');
    }
  }, [signOut]);

  const navigateTo = useCallback(
    (path: string) => {
      navigate(path);
      setIsMenuOpen(false); // Close mobile menu when navigating
    },
    [navigate]
  );

  // Memoized mobile menu component
  const MobileMenu = useCallback(
    () => (
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[80%] sm:w-[350px] pt-10">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-left" onClick={() => navigateTo('/')}>
              <div className="flex items-center space-x-2">
                <img src="/buy-it-logo.png" alt="Insbuy" className="h-8" />
              </div>
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={() => setIsMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </SheetHeader>
          <div className="flex flex-col gap-1 py-2">
            <Button
              variant="ghost"
              className={cn(
                'justify-start px-2 py-6 text-base',
                isActive('/explore') && 'bg-accent text-accent-foreground'
              )}
              onClick={() => navigateTo('/explore')}
            >
              Explore
            </Button>
            <Button
              variant="ghost"
              className={cn(
                'justify-start px-2 py-6 text-base',
                isActive('/starred') && 'bg-accent text-accent-foreground'
              )}
              onClick={() => navigateTo('/starred')}
            >
              Starred
            </Button>
            {user ? (
              <>
                <div className="border-t my-2 pt-2">
                  <p className="px-2 py-1 text-sm text-muted-foreground">Account</p>
                </div>
                <Button
                  variant="ghost"
                  className="justify-start px-2 py-6 text-base"
                  onClick={() => navigateTo('/account/edit-profile')}
                >
                  Edit profile
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start px-2 py-6 text-base"
                  onClick={() => navigateTo('/account/change-password')}
                >
                  Change password
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start px-2 py-6 text-base text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  onClick={handleSignOut}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <div className="border-t my-2 pt-2">
                  <p className="px-2 py-1 text-sm text-muted-foreground">Account</p>
                </div>
                <Button
                  variant="ghost"
                  className="justify-start px-2 py-6 text-base"
                  onClick={handleSignIn}
                >
                  Sign in
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start px-2 py-6 text-base"
                  onClick={handleSignUp}
                >
                  Sign up
                </Button>
              </>
            )}
            <div className="border-t mt-4 pt-4">
              <div className="flex items-center justify-between px-2 py-2">
                <span className="text-sm font-medium">Toggle theme</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    ),
    [isMenuOpen, navigateTo, isActive, user, handleSignIn, handleSignOut, handleSignUp]
  );

  // Memoized desktop menu items
  const DesktopMenu = useCallback(
    () => (
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                isActive('/explore') && 'bg-accent text-accent-foreground'
              )}
              onClick={() => navigateTo('/explore')}
            >
              Explore
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                isActive('/starred') && 'bg-accent text-accent-foreground'
              )}
              onClick={() => navigateTo('/starred')}
            >
              Starred
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    ),
    [isActive, navigateTo]
  );

  // Memoized auth buttons
  const AuthButtons = useCallback(
    () => (
      <>
        <ThemeToggle />
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="cursor-pointer">
              <Button variant={isAccountPage() ? 'default' : 'outline'}>Account</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigateTo('/account/edit-profile')}
                className="cursor-pointer"
              >
                Edit profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigateTo('/account/change-password')}
                className="cursor-pointer"
              >
                Change password
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-red-500 hover:text-red-600 focus:text-red-600"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button variant="ghost" onClick={handleSignIn}>
              Sign in
            </Button>
            <Button variant="default" onClick={handleSignUp}>
              Sign up
            </Button>
          </>
        )}
      </>
    ),
    [user, isAccountPage, navigateTo, handleSignIn, handleSignOut, handleSignUp]
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 sm:h-16 items-center justify-between mx-auto px-4">
        {/* Left section - Mobile menu and logo */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button - Only visible on mobile */}
          <div className="md:hidden">
            <MobileMenu />
          </div>

          {/* Logo */}
          <button
            onClick={() => navigateTo('/')}
            className="flex items-center space-x-2 focus:outline-none cursor-pointer"
          >
            <img src="/buy-it-logo.png" alt="Insbuy" className="h-6 sm:h-8" />
          </button>
        </div>

        {/* Center section - Navigation */}
        <div className="hidden md:flex items-center justify-center">
          <DesktopMenu />
        </div>

        {/* Right section - Auth Buttons */}
        <div className="hidden md:flex items-center gap-2">
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}

export default memo(Header);
