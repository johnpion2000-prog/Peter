import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { getAuthError } from '../../utils/firebaseErrors';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const { resetPassword } = useAuthContext();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err: any) {
      toast.error(getAuthError(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔑</div>
          <h1 className="text-2xl font-extrabold text-gray-900">Reset Password</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your email to receive a reset link</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-green-600 font-medium">Check your inbox for the reset link!</p>
            <Link to="/signin" className="text-orange-500 hover:text-orange-600 text-sm font-medium">← Back to Sign In</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">Send Reset Email</Button>
            <p className="text-center text-sm">
              <Link to="/signin" className="text-orange-500 hover:text-orange-600 font-medium">← Back to Sign In</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
