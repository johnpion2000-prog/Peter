import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { ClockIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function PendingApprovalPage() {
  const { appUser, logout } = useAuthContext();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ClockIcon className="w-10 h-10 text-yellow-500" />
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Application Under Review</h1>

        <p className="text-gray-600 mb-3">
          Hi <strong>{appUser?.displayName ?? 'there'}</strong>! Your company application has been submitted successfully.
        </p>

        <div className="flex items-center justify-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mb-6">
          <EnvelopeIcon className="w-4 h-4 text-orange-400 flex-shrink-0" />
          <p className="text-sm text-orange-800">
            We'll notify you at <strong>{appUser?.email}</strong> once approved.
          </p>
        </div>

        <p className="text-sm text-gray-400 mb-8">
          Our team reviews applications within 1–2 business days. While waiting, you can browse the marketplace as a customer.
        </p>

        {/* Steps */}
        <div className="text-left space-y-3 mb-8">
          {[
            { num: 1, label: 'Application submitted',   done: true },
            { num: 2, label: 'Admin review & approval', done: false },
            { num: 3, label: 'Start selling',           done: false },
          ].map(({ num, label, done }) => (
            <div key={num} className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {done ? '✓' : num}
              </div>
              <span className={`text-sm ${done ? 'text-green-700 font-medium' : 'text-gray-500'}`}>{label}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Link
            to="/"
            className="block w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors text-center"
          >
            Browse the Marketplace
          </Link>
          <button
            onClick={() => logout()}
            className="block w-full py-2.5 px-4 border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium rounded-xl transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
