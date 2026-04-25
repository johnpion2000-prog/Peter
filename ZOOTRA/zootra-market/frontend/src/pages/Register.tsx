import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getFirebaseErrorMessage } from '../utils/firebaseErrors';
import Button from '../components/ui/Button';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<'customer' | 'provider'>('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700">ZOOTRA</h1>
          <p className="text-gray-500 text-sm mt-1">Create your account</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Full Name', val: name, set: setName, type: 'text', ph: 'John Doe' },
            { label: 'Email', val: email, set: setEmail, type: 'email', ph: 'john@example.com' },
            { label: 'Password', val: password, set: setPassword, type: 'password', ph: 'Min 6 characters' },
            { label: 'Confirm Password', val: confirm, set: setConfirm, type: 'password', ph: 'Repeat password' },
          ].map(({ label, val, set, type, ph }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type={type} value={val} onChange={(e) => set(e.target.value)} required placeholder={ph}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input type="radio" name="role" value="customer" checked={role === 'customer'} onChange={() => setRole('customer')} className="form-radio text-green-600" />
                <span className="ml-2">Customer</span>
              </label>
              <label className="inline-flex items-center">
                <input type="radio" name="role" value="provider" checked={role === 'provider'} onChange={() => setRole('provider')} className="form-radio text-green-600" />
                <span className="ml-2">Company / Seller</span>
              </label>
            </div>
          </div>
          <Button type="submit" loading={loading} className="w-full" size="lg">Create Account</Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-green-600 font-medium hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
