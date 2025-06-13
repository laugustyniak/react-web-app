import { AlertCircle } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ContentCard, PageLayout } from './ui/layout';

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setError('');
      setIsLoading(true);
      await signIn(email, password, '/');
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Failed to sign in. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setIsLoading(true);
      await signInWithGoogle('/');
    } catch (err) {
      console.error('Google sign in error:', err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignUp = () => {
    navigate('/sign-up');
  };

  const navigateToResetPassword = () => {
    navigate('/reset-password');
  };

  return (
    <PageLayout>
      <ContentCard className="max-w-md w-full">
        <CardHeader className="flex flex-col items-center">
          <div className="flex justify-center w-full my-4">
            <img src="/favicon.png" alt="Buy It" className="w-20 h-20" />
          </div>
          <CardTitle className="text-center text-2xl font-bold">Sign in to your account</CardTitle>
          <CardDescription className="text-center mt-2">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        {error && (
          <div className="mx-6 mb-4">
            <div
              className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded flex items-center gap-2"
              role="alert"
            >
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <CardContent>
          <form className="space-y-4 my-8" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={isLoading}
                className="bg-white dark:bg-gray-800"
              />

              <div className="flex items-center justify-end mb-4">
                <button
                  type="button"
                  onClick={navigateToResetPassword}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading}
                className="bg-white dark:bg-gray-800"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Sign in with Google'}
          </Button>

          <div className="text-center w-full text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={navigateToSignUp}
              className="text-blue-600 dark:text-blue-400 hover:underline"
              type="button"
            >
              Sign up
            </button>
          </div>
        </CardFooter>
      </ContentCard>
    </PageLayout>
  );
}
