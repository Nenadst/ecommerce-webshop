import { poppins } from '@/lib/fonts'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className={`${poppins.variable} min-h-screen flex items-center justify-center bg-gray-100`}>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-sky-900 mb-6 text-center">Login to Your Account</h1>
        
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-900 focus:ring focus:ring-sky-900/30"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-900 focus:ring focus:ring-sky-900/30"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link href="/forgot-password" className="text-sky-900 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-sky-900 text-white font-semibold py-2 px-4 rounded hover:bg-sky-800 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}