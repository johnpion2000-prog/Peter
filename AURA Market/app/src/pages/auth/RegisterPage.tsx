import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthContext } from '../../context/AuthContext';
import { applyAsVendor } from '../../services/companyService';
import { getAuthError } from '../../utils/firebaseErrors';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import {
  ShoppingCartIcon,
  BuildingStorefrontIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

/* ── Schemas ──────────────────────────────────────────────────────── */
const baseFields = {
  displayName: z.string().min(2, 'Minimum 2 characters'),
  email:       z.string().email('Invalid email'),
  password:    z.string().min(6, 'Minimum 6 characters'),
  confirm:     z.string(),
};

const individualSchema = z.object(baseFields)
  .refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

const vendorSchema = z.object({
  ...baseFields,
  companyName:  z.string().min(2, 'Company name required'),
  companyEmail: z.string().email('Valid business email required'),
  description:  z.string().min(10, 'Minimum 10 characters').max(500, 'Maximum 500 characters'),
}).refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

type IndividualData = z.infer<typeof individualSchema>;
type VendorData     = z.infer<typeof vendorSchema>;
type Step = 'select' | 'individual' | 'vendor';

/* ── Account type card ───────────────────────────────────────────── */
function TypeCard({
  icon, title, subtitle, features, onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  features: string[];
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-gray-200 hover:border-orange-400 hover:shadow-md hover:bg-orange-50/40 transition-all cursor-pointer text-center group w-full"
    >
      <div className="w-14 h-14 rounded-full bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
        <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
      </div>
      <ul className="text-left w-full space-y-1">
        {features.map(f => (
          <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-orange-400 font-bold">✓</span> {f}
          </li>
        ))}
      </ul>
      <span className="text-orange-500 font-semibold text-sm group-hover:underline">Get started →</span>
    </button>
  );
}

/* ── Main ────────────────────────────────────────────────────────── */
export default function RegisterPage() {
  const { signUp } = useAuthContext();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('select');
  const [loading, setLoading] = useState(false);

  /* Individual form */
  const {
    register: regInd,
    handleSubmit: handleInd,
    formState: { errors: errInd },
  } = useForm<IndividualData>({ resolver: zodResolver(individualSchema) });

  /* Vendor form */
  const {
    register: regVen,
    handleSubmit: handleVen,
    formState: { errors: errVen },
  } = useForm<VendorData>({ resolver: zodResolver(vendorSchema) });

  /* ── Individual submit ── */
  async function submitIndividual(data: IndividualData) {
    setLoading(true);
    try {
      await signUp(data.email, data.password, data.displayName);
      toast.success('Account created! Welcome to AURA Market!');
      navigate('/');
    } catch (err: any) {
      toast.error(getAuthError(err.code));
    } finally {
      setLoading(false);
    }
  }

  /* ── Vendor submit ── */
  async function submitVendor(data: VendorData) {
    setLoading(true);
    try {
      const uid = await signUp(data.email, data.password, data.displayName);
      await applyAsVendor(uid, data.email, {
        companyName:  data.companyName,
        companyEmail: data.companyEmail,
        description:  data.description,
      });
      toast.success("Application submitted! We'll review it shortly.");
      navigate('/pending-approval');
    } catch (err: any) {
      toast.error(getAuthError(err.code));
    } finally {
      setLoading(false);
    }
  }

  /* ── Step: select account type ── */
  if (step === 'select') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 px-4 py-10">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">✨</div>
            <h1 className="text-2xl font-extrabold text-gray-900">Join AURA Market</h1>
            <p className="text-gray-500 text-sm mt-1">Choose how you'd like to use our platform</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TypeCard
              icon={<ShoppingCartIcon className="w-7 h-7 text-orange-500" />}
              title="Individual"
              subtitle="Shop the marketplace"
              features={['Browse & buy products', 'Track your orders', 'Save favourites']}
              onClick={() => setStep('individual')}
            />
            <TypeCard
              icon={<BuildingStorefrontIcon className="w-7 h-7 text-orange-500" />}
              title="Company / Vendor"
              subtitle="Sell on the marketplace"
              features={['List your products', 'Manage orders & sales', 'Reach thousands of customers']}
              onClick={() => setStep('vendor')}
            />
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/signin" className="text-orange-500 font-medium hover:text-orange-600">Sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  /* ── Step: individual signup ── */
  if (step === 'individual') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <button
            type="button"
            onClick={() => setStep('select')}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
          >
            <ArrowLeftIcon className="w-4 h-4" /> Back
          </button>

          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShoppingCartIcon className="w-6 h-6 text-orange-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">Create account</h1>
            <p className="text-gray-500 text-sm mt-1">Start shopping today</p>
          </div>

          <form onSubmit={handleInd(submitIndividual)} className="space-y-4">
            <Input label="Full Name"         error={errInd.displayName?.message} {...regInd('displayName')} />
            <Input label="Email" type="email" error={errInd.email?.message}       {...regInd('email')} />
            <Input label="Password" type="password" error={errInd.password?.message} {...regInd('password')} />
            <Input label="Confirm Password" type="password" error={errInd.confirm?.message} {...regInd('confirm')} />
            <Button type="submit" loading={loading} className="w-full" size="lg">Create Account</Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/signin" className="text-orange-500 font-medium hover:text-orange-600">Sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  /* ── Step: vendor / company signup ── */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
        <button
          type="button"
          onClick={() => setStep('select')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Back
        </button>

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <BuildingStorefrontIcon className="w-6 h-6 text-orange-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Vendor Application</h1>
          <p className="text-gray-500 text-sm mt-1">Apply to sell on AURA Market</p>
        </div>

        <form onSubmit={handleVen(submitVendor)} className="space-y-4">
          {/* Personal account info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Account</p>
            <Input label="Full Name"         error={errVen.displayName?.message} {...regVen('displayName')} />
            <Input label="Email" type="email" error={errVen.email?.message}       {...regVen('email')} />
            <Input label="Password" type="password"         error={errVen.password?.message} {...regVen('password')} />
            <Input label="Confirm Password" type="password" error={errVen.confirm?.message}  {...regVen('confirm')} />
          </div>

          {/* Company info */}
          <div className="bg-orange-50 rounded-xl p-4 space-y-4">
            <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider">Company Info</p>
            <Input label="Company Name"    error={errVen.companyName?.message}  {...regVen('companyName')} placeholder="e.g. AURA Clothing Co." />
            <Input label="Business Email" type="email" error={errVen.companyEmail?.message} {...regVen('companyEmail')} placeholder="contact@yourcompany.com" />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                placeholder="Tell us about your company and the products you sell…"
                className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 transition resize-none ${
                  errVen.description
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-gray-300 focus:ring-orange-400 focus:border-orange-400'
                }`}
                {...regVen('description')}
              />
              {errVen.description && <p className="text-xs text-red-500">{errVen.description.message}</p>}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800">
            ⏳ Your application will be reviewed by our team. You'll be notified by email once approved.
          </div>

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Submit Application
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/signin" className="text-orange-500 font-medium hover:text-orange-600">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
