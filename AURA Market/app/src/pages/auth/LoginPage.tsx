import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthContext } from '../../context/AuthContext';
import { getAuthError } from '../../utils/firebaseErrors';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const schema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(6, 'Minimum 6 characters'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { signIn, signInWithGoogle } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? null;

  function redirectAfterLogin(role: string) {
    if (role === 'superAdmin' || role === 'companyAdmin') {
      navigate('/admin', { replace: true });
    } else {
      navigate(from ?? '/', { replace: true });
    }
  }
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const user = await signIn(data.email, data.password);
      redirectAfterLogin(user.role);
    } catch (err: any) {
      toast.error(getAuthError(err.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      const user = await signInWithGoogle();
      redirectAfterLogin(user.role);
    } catch (err: any) {
      toast.error(getAuthError(err.code));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">✨</div>
          <h1 className="text-2xl font-extrabold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your AURA Market account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Input label="Password" type="password" error={errors.password?.message} {...register('password')} />

          <div className="text-right">
            <Link to="/reset-password" className="text-sm text-orange-500 hover:text-orange-600">Forgot password?</Link>
          </div>

          <Button type="submit" loading={loading} className="w-full" size="lg">Sign In</Button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative text-center"><span className="bg-white px-4 text-xs text-gray-500">or</span></div>
        </div>

        <Button variant="outline" size="lg" className="w-full" onClick={handleGoogle} loading={googleLoading}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-4 h-4" />
          Continue with Google
        </Button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-orange-500 font-medium hover:text-orange-600">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
