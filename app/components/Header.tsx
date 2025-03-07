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
import { Menu } from 'lucide-react';
import { cn } from '~/lib/utils';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  // Check if the current path matches the given path
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Check if the current path is an account page
  const isAccountPage = () => {
    return location.pathname.startsWith('/account/');
  };

  const handleSignIn = async () => {
    try {
      navigate('/sign-in');
    } catch (error) {
      console.error('Failed to redirect to sign in');
    }
  };

  const handleSignUp = async () => {
    try {
      navigate('/sign-up');
    } catch (error) {
      console.error('Failed to redirect to sign up');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut('/');
    } catch (error) {
      console.error('Failed to sign out');
    }
  };

  const navigateTo = (path: string) => {
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between mx-auto px-4">
        {/* Left section - Mobile menu and logo */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button - Only visible on mobile */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle className="text-left" onClick={() => navigateTo('/')}>
                    <div className="flex items-center space-x-2">
                      <img src="/300x300.png" alt="Insbay" className="h-8 w-8" />
                      <span className="font-bold text-xl text-indigo-600">Insbay</span>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 py-6">
                  <Button
                    variant="ghost"
                    className={cn(
                      'justify-start px-2',
                      isActive('/explore') && 'bg-accent text-accent-foreground'
                    )}
                    onClick={() => navigateTo('/explore')}
                  >
                    Explore
                  </Button>
                  <Button
                    variant="ghost"
                    className={cn(
                      'justify-start px-2',
                      isActive('/starred') && 'bg-accent text-accent-foreground'
                    )}
                    onClick={() => navigateTo('/starred')}
                  >
                    Starred
                  </Button>
                  {user ? (
                    <>
                      <Button
                        variant="ghost"
                        className="justify-start px-2"
                        onClick={() => navigateTo('/account/edit-profile')}
                      >
                        Edit profile
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start px-2"
                        onClick={() => navigateTo('/account/change-password')}
                      >
                        Change password
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start px-2"
                        onClick={handleSignOut}
                      >
                        Sign out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" className="justify-start px-2" onClick={handleSignIn}>
                        Sign in
                      </Button>
                      <Button variant="ghost" className="justify-start px-2" onClick={handleSignUp}>
                        Sign up
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <button
            onClick={() => navigateTo('/')}
            className="flex items-center space-x-2 focus:outline-none cursor-pointer"
          >
            <img src="/300x300.png" alt="Insbay" className="h-8 w-8" />
            <span className="font-bold text-xl text-indigo-600">Insbay</span>
          </button>
        </div>

        {/* Center section - Navigation */}
        <div className="hidden md:flex items-center justify-center">
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
        </div>

        {/* Right section - Auth Buttons */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
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
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleSignIn}>
                Sign in
              </Button>
              <Button onClick={handleSignUp}>Sign up</Button>
            </>
          )}
        </div>

        {/* Empty div for mobile to balance the layout */}
        <div className="md:hidden w-10"></div>
      </div>
    </header>
  );
}
