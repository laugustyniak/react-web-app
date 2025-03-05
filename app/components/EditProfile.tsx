import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { User } from '../lib/dataTypes';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-3xl font-extrabold">Edit Profile</CardTitle>
            <CardDescription className="text-center">
              Update your profile information
            </CardDescription>
          </CardHeader>

          {error && (
            <div className="px-6">
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2"
                role="alert"
              >
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="px-6">
              <div
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center gap-2"
                role="alert"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{success}</span>
              </div>
            </div>
          )}

          <CardContent>
            {profileLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleProfileUpdate}>
                <div className="space-y-2">
                  <Input
                    id="display-name"
                    name="displayName"
                    type="text"
                    placeholder="Display Name"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                  />

                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    disabled
                  />

                  <Input
                    id="photo-url"
                    name="photoURL"
                    type="text"
                    placeholder="Profile Photo URL"
                    value={photoURL}
                    onChange={e => setPhotoURL(e.target.value)}
                  />

                  <Input
                    id="phone-number"
                    name="phoneNumber"
                    type="tel"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
