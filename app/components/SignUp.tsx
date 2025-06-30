import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ContentCard, PageLayout } from './ui/layout';

export default function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setError('');
      setIsLoading(true);
      await signUp(email, password);
      navigate('/');
    } catch (err) {
      console.error('Sign up error:', err);
      setError('Failed to create an account. This email may already be in use.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setError('');
      setIsLoading(true);
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      console.error('Google sign up error:', err);
      setError('Failed to sign up with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignIn = () => {
    navigate('/sign-in');
  };

  return (
    <PageLayout>
      <ContentCard className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center w-full my-4">
            <img src="/favicon.png" alt="Buy It" className="w-20 h-20" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Create your account</CardTitle>
          <CardDescription className="text-center">Enter your details to sign up</CardDescription>
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
                id="email"
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
            </div>

            <div className="space-y-2">
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading}
                className="bg-white dark:bg-gray-800"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Password must be at least 6 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="bg-white dark:bg-gray-800"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Sign up'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            onClick={handleGoogleSignUp}
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Sign up with Google'}
          </Button>

          <div className="text-center w-full text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <button
              onClick={navigateToSignIn}
              className="text-blue-600 dark:text-blue-400 hover:underline"
              type="button"
            >
              Sign in
            </button>
          </div>
        </CardFooter>
      </ContentCard>
    </PageLayout>
  );
}
