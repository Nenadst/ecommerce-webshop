'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useActivityTracker } from '@/shared/hooks/useActivityTracker';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import Button from '@/shared/components/elements/Button';

export default function LogoutPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { trackActivity } = useActivityTracker();

  useEffect(() => {
    // Track logout before actually logging out
    if (user) {
      trackActivity({
        action: 'LOGOUT',
        description: `User ${user.email} logged out`,
      });
    }

    // Call logout immediately
    logout();

    // Redirect to home after 2 seconds
    const timer = setTimeout(() => {
      router.push('/');
    }, 2000);

    return () => clearTimeout(timer);
  }, [logout, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-sky-100 to-cyan-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <LogOut className="w-12 h-12 text-sky-600" />
        </div>
        <h1 className="text-4xl font-bold text-sky-900 mb-4">Logging Out...</h1>
        <p className="text-gray-600 text-lg mb-8">
          You have been successfully logged out. Redirecting to home page...
        </p>
        <div className="flex justify-center mb-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
        </div>
        <Link href="/">
          <Button className="bg-sky-900 hover:bg-sky-800 text-white px-8 py-3 text-lg font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl">
            Go to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
