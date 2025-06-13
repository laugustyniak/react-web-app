import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ContentCard, PageLayout } from './ui/layout';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setIsLoading(true);
      await resetPassword(email);
      setSuccess('Password reset email sent. Please check your inbox.');
      // Don't clear the email field so the user can see what address they used
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to send password reset email. Please check if the email is correct.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignIn = () => {
    navigate('/sign-in');
  };

  return (
    <PageLayout>
      <ContentCard className="max-w-md w-full">
        <CardHeader className="flex flex-col items-center">
          <div className="flex justify-center w-full my-4">
            <img src="/favicon.png" alt="Buy It" className="w-20 h-20" />
          </div>
          <CardTitle className="text-center text-2xl font-bold">Reset Your Password</CardTitle>
          <CardDescription className="text-center mt-2">
            Enter your email address and we'll send you a link to reset your password
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

        {success && (
          <div className="mx-6 mb-4">
            <div
              className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded flex items-center gap-2"
              role="alert"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{success}</span>
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
                placeholder="Enter your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={isLoading}
                className="bg-white dark:bg-gray-800"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <div className="text-center w-full text-sm text-gray-600 dark:text-gray-400">
            Remember your password?{' '}
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
