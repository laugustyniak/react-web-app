import { useNavigate } from 'react-router';
import { Button } from '~/components/ui/button';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

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
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-indigo-600 mr-8">
              <button
                onClick={() => navigateTo('/')}
                className="flex items-center focus:outline-none cursor-pointer"
              >
                <img src="/300x300.png" alt="Insbay" className="w-10 h-10" />
              </button>
            </h1>
            <div className="hidden md:flex space-x-8">
              <button
                onClick={() => navigateTo('/explore')}
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
              >
                Explore
              </button>
              <button
                onClick={() => navigateTo('/starred')}
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
              >
                Starred
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <Button onClick={() => navigateTo('/account')} variant="outline">
                  Account
                </Button>
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
        </div>
      </div>
    </nav>
  );
}
