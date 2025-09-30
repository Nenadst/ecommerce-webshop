'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Shield } from 'lucide-react';
import { useAuth } from '@/shared/contexts/AuthContext';
import HeaderTop from '@/shared/components/layouts/HeaderTop';
import HeaderBottom from '@/shared/components/layouts/HeaderBottom';
import Footer from '@/shared/components/layouts/Footer';
import { useMutation } from '@apollo/client';
import { UPDATE_USER_MUTATION } from '@/shared/graphql/mutations/auth.mutations';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [updateUser, { loading: updateLoading }] = useMutation(UPDATE_USER_MUTATION);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?returnUrl=%2Fprofile');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-sky-900 text-lg">Redirecting to login...</div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) return;

    try {
      const { data } = await updateUser({
        variables: {
          id: user.id,
          input: {
            name,
            email,
          },
        },
      });

      if (data?.updateUser) {
        login(data.updateUser.token, data.updateUser.user);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <main className="bg-white">
      <HeaderTop />
      <HeaderBottom />
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-3xl mx-auto px-4">

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-sky-900 px-8 py-12 text-white">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-amber-500 flex items-center justify-center text-3xl font-bold">
                {getInitials(user?.name, user?.email)}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{user?.name || 'User Profile'}</h1>
                <p className="text-sky-200">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-sky-900">Account Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-sky-900 text-white px-4 py-2 rounded hover:bg-sky-800 transition text-sm font-semibold"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline w-4 h-4 mr-2" />
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline w-4 h-4 mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="flex-1 bg-sky-900 text-white font-semibold py-3 rounded-lg hover:bg-sky-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setName(user?.name || '');
                      setEmail(user?.email || '');
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-500">Name</span>
                  </div>
                  <p className="text-lg text-gray-900 ml-8">{user?.name || 'Not provided'}</p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-500">Email</span>
                  </div>
                  <p className="text-lg text-gray-900 ml-8">{user?.email}</p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-500">Role</span>
                  </div>
                  <p className="text-lg text-gray-900 ml-8">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      user?.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user?.role === 'admin' ? 'Administrator' : 'User'}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg mt-6 p-8" style={{ boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
          <h2 className="text-2xl font-semibold text-sky-900 mb-4">Account Settings</h2>
          <div className="space-y-4">
            <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <span className="font-medium text-gray-700">Change Password</span>
              <p className="text-sm text-gray-500 mt-1">Update your password to keep your account secure</p>
            </button>
            <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <span className="font-medium text-gray-700">Notification Preferences</span>
              <p className="text-sm text-gray-500 mt-1">Manage how you receive notifications</p>
            </button>
            <button className="w-full text-left px-4 py-3 border border-red-200 rounded-lg hover:bg-red-50 transition">
              <span className="font-medium text-red-600">Delete Account</span>
              <p className="text-sm text-red-500 mt-1">Permanently delete your account and all data</p>
            </button>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </main>
  );
}