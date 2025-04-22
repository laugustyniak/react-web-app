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
import { Menu, Plus, X } from 'lucide-react';
import { cn } from '~/lib/utils';
import { ThemeToggle } from './ui/theme-toggle';
import { useState, useCallback, memo } from 'react';
import {
  CreateInspirationModal,
  CreateProgramModal,
  CreateProductModal,
  EditProductModal,
  DeleteConfirmationModal,
} from './modals';
import { deleteProduct, updateProduct } from '~/lib/firestoreService';
import type { Product } from '~/lib/dataTypes';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isInspirationModalOpen, setIsInspirationModalOpen] = useState<boolean>(false);
  const [isProgramModalOpen, setIsProgramModalOpen] = useState<boolean>(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState<boolean>(false);
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  const handleAddInspiration = useCallback(() => {
    setIsInspirationModalOpen(true);
  }, []);

  const handleAddProgram = useCallback(() => {
    setIsProgramModalOpen(true);
  }, []);

  const handleAddProduct = useCallback(() => {
    setIsProductModalOpen(true);
  }, []);

  // Add refresh handlers
  const handleInspirationAdd = useCallback(() => {
    setIsInspirationModalOpen(false);
    // Trigger a custom event that components can listen to
    window.dispatchEvent(new CustomEvent('refreshInspirations'));
  }, []);

  const handleProgramAdd = useCallback(() => {
    setIsProgramModalOpen(false);
    window.dispatchEvent(new CustomEvent('refreshPrograms'));
  }, []);

  const handleProductAdd = useCallback(() => {
    setIsProductModalOpen(false);
    window.dispatchEvent(new CustomEvent('refreshProducts'));
  }, []);

  const handleProductEdit = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsEditProductModalOpen(true);
  }, []);

  const handleProductDelete = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsDeleteProductModalOpen(true);
  }, []);

  const handleProductDeleteConfirm = useCallback(async () => {
    if (selectedProduct) {
      try {
        await deleteProduct(selectedProduct.id);
        window.dispatchEvent(new CustomEvent('refreshProducts'));
        setIsDeleteProductModalOpen(false);
        setSelectedProduct(null);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  }, [selectedProduct]);

  const handleProductEditSubmit = useCallback(async (id: string, data: Partial<Product>) => {
    try {
      await updateProduct(id, data);
      window.dispatchEvent(new CustomEvent('refreshProducts'));
      setIsEditProductModalOpen(false);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  }, []);

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
                <img src="/buy-it-logo-light.png" alt="Buy It" className="h-8 dark:hidden" />
                <img src="/buy-it-logo-dark.png" alt="Buy It" className="h-8 hidden dark:block" />
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
            {isAdmin && (
              <>
                <Button
                  variant="ghost"
                  className={cn(
                    'justify-start px-2 py-6 text-base',
                    isActive('/generate-inspiration') ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-l-4 border-amber-400',
                  )}
                  onClick={() => navigateTo('/generate-inspiration')}
                >
                  ✨ Generate Inspiration
                  <span className="ml-2 text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded px-1">Internal</span>
                </Button>
                <Button
                  variant="ghost"
                  className={cn(
                    'justify-start px-2 py-6 text-base',
                    isActive('/video-frame-extraction') ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-l-4 border-amber-400',
                  )}
                  onClick={() => navigateTo('/video-frame-extraction')}
                >
                  🎬 Extract Frames
                  <span className="ml-2 text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded px-1">Internal</span>
                </Button>
                <Button
                  variant="ghost"
                  className={cn(
                    'justify-start px-2 py-6 text-base',
                    isActive('/product-extraction') ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-l-4 border-amber-400',
                  )}
                  onClick={() => navigateTo('/product-extraction')}
                >
                  🎥 Products
                  <span className="ml-2 text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded px-1">Internal</span>
                </Button>
              </>
            )}
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
    [isMenuOpen, navigateTo, isActive, user, handleSignIn, handleSignOut, handleSignUp, isAdmin]
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
          {isAdmin && (
            <>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                    isActive('/generate-inspiration') ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-b-2 border-amber-400',
                  )}
                  onClick={() => navigateTo('/generate-inspiration')}
                >
                  ✨ Generate Inspiration
                  <span className="ml-2 text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded px-1">Internal</span>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                    isActive('/video-frame-extraction') ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-b-2 border-amber-400',
                  )}
                  onClick={() => navigateTo('/video-frame-extraction')}
                >
                  🎬 Extract Frames
                  <span className="ml-2 text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded px-1">Internal</span>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                    isActive('/product-extraction') ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-b-2 border-amber-400',
                  )}
                  onClick={() => navigateTo('/product-extraction')}
                >
                  🎥 Products
                  <span className="ml-2 text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded px-1">Internal</span>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </>
          )}
        </NavigationMenuList>
      </NavigationMenu>
    ),
    [isActive, navigateTo, user, isAdmin]
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

  // Memoized admin buttons
  const AdminButtons = useCallback(
    () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="cursor-pointer">
          <Button size="sm" variant="outline" className="cursor-pointer">
            <Plus className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleAddInspiration} className="cursor-pointer">
            Inspiration
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAddProduct} className="cursor-pointer">
            Product
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAddProgram} className="cursor-pointer">
            Program
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    [handleAddInspiration, handleAddProgram, handleAddProduct]
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
            <img src="/buy-it-logo-light.png" alt="Buy It" className="h-8 dark:hidden" />
            <img src="/buy-it-logo-dark.png" alt="Buy It" className="h-8 hidden dark:block" />
          </button>
        </div>

        {/* Center section - Navigation */}
        <div className="hidden md:flex items-center justify-center">
          <DesktopMenu />
        </div>

        {/* Right section - Auth Buttons */}
        <div className="hidden md:flex items-center gap-2">
          <AuthButtons />
          {isAdmin && <AdminButtons />}
        </div>
      </div>

      {/* Modals */}
      <CreateInspirationModal
        open={isInspirationModalOpen}
        onOpenChange={setIsInspirationModalOpen}
        onSuccess={handleInspirationAdd}
      />
      <CreateProductModal
        open={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        onSuccess={handleProductAdd}
      />
      <CreateProgramModal
        open={isProgramModalOpen}
        onOpenChange={setIsProgramModalOpen}
        onSuccess={handleProgramAdd}
      />
      {selectedProduct && (
        <>
          <EditProductModal
            open={isEditProductModalOpen}
            onOpenChange={setIsEditProductModalOpen}
            product={selectedProduct}
            onEdit={handleProductEditSubmit}
          />
          <DeleteConfirmationModal
            open={isDeleteProductModalOpen}
            onOpenChange={setIsDeleteProductModalOpen}
            title={selectedProduct.title}
            onConfirm={handleProductDeleteConfirm}
          />
        </>
      )}
    </header>
  );
}

export default memo(Header);
