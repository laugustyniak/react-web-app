import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { User } from '../lib/dataTypes';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PageLayout, ContentCard } from './ui/layout';
import Header from './Header';
import Footer from './Footer';

export default function EditProfile() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [, setUser] = useState<User | null>(null);
  const { user: authUser } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (authUser) {
        try {
          setProfileLoading(true);

          // First, initialize with Firebase auth data
          const userData: User = {
            id: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            photoURL: authUser.photoURL,
            phoneNumber: authUser.phoneNumber,
          };

          // Get user document from Firestore
          const userDocRef = doc(db, 'users', authUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            // User exists in Firestore, merge the data
            const firestoreData = userDocSnap.data();
            const mergedUser: User = {
              ...userData,
              ...firestoreData,
              // Always keep the id and email from Firebase auth
              id: authUser.uid,
              email: authUser.email,
            };

            setUser(mergedUser);
            setDisplayName(mergedUser.displayName || '');
            setEmail(mergedUser.email || '');
            setPhotoURL(mergedUser.photoURL || '');
            setPhoneNumber(mergedUser.phoneNumber || '');
          } else {
            // User doesn't exist in Firestore yet, create it
            await setDoc(userDocRef, userData);
            setUser(userData);
            setDisplayName(userData.displayName || '');
            setEmail(userData.email || '');
            setPhotoURL(userData.photoURL || '');
            setPhoneNumber(userData.phoneNumber || '');
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setError('Failed to load user profile');
        } finally {
          setProfileLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [authUser]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authUser) {
      return setError('You must be logged in to update your profile');
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);

      // Update the user profile in Firestore
      const userDocRef = doc(db, 'users', authUser.uid);
      const updatedUserData: Partial<User> = {
        displayName,
        photoURL,
        phoneNumber,
      };

      await updateDoc(userDocRef, updatedUserData);

      // Update the local user state
      setUser(prev => (prev ? { ...prev, ...updatedUserData } : null));

      setSuccess('Profile information updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <PageLayout>
        <ContentCard>
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">Edit Profile</CardTitle>
            <CardDescription className="text-center">
              Update your profile information
            </CardDescription>
          </CardHeader>

          {error && (
            <div className="mb-4 mx-6">
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
            <div className="mb-4 mx-6">
              <div
                className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded flex items-center gap-2"
                role="alert"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{success}</span>
              </div>
            </div>
          )}

          {profileLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <CardContent>
              <form className="space-y-4" onSubmit={handleProfileUpdate}>
                <div className="space-y-2">
                  <label
                    htmlFor="displayName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Display Name
                  </label>
                  <Input
                    id="displayName"
                    name="displayName"
                    type="text"
                    autoComplete="name"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Display Name"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    disabled
                    placeholder="Email"
                  />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="photoURL"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Profile Photo URL
                  </label>
                  <Input
                    id="photoURL"
                    name="photoURL"
                    type="text"
                    value={photoURL || ''}
                    onChange={e => setPhotoURL(e.target.value)}
                    placeholder="Profile Photo URL"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Phone Number
                  </label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    autoComplete="tel"
                    value={phoneNumber || ''}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="Phone Number"
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </ContentCard>
      </PageLayout>
      <Footer />
    </>
  );
}
