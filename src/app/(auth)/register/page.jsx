import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <div className="w-full py-6 px-4 sm:px-6 lg:px-8 animate-slideInDown">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold animate-gradient-text">
              BusEase
            </span>
          </Link>
          <Link 
            href="/login"
            className="text-blue-600 hover:text-blue-700 transition-all duration-300 hover:scale-105 transform"
          >
            Login
          </Link>
        </div>
      </div>

      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md animate-scaleIn">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6 animate-text-fade-up stagger-1">
            Create your account
          </h2>
          <p className="text-center text-gray-600 max-w-sm mx-auto animate-text-fade-up stagger-2">
            Register to book your bus tickets and manage your journeys
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-slideInUp">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 hover:shadow-2xl transition-shadow duration-300">
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}
