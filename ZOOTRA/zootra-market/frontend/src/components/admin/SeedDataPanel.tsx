import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { createProduct } from '../../services/productService';
import { useAuth } from '../../contexts/AuthContext';

const SAMPLE_PRODUCTS = [
  {
    productName: 'Friesian Dairy Cow',
    category: 'livestock' as const,
    price: 850000,
    discountPercent: 10,
    description: 'High-yield Friesian dairy cow, 3 years old, healthy and vaccinated. Producing 15–20 litres per day.',
    stock: 2,
    location: 'Kigali',
    imageURL: 'https://images.unsplash.com/photo-1570912460819-a8a9636ae0a6?w=400',
  },
  {
    productName: 'Boer Goats (Pair)',
    category: 'livestock' as const,
    price: 120000,
    discountPercent: 0,
    description: 'Pure Boer goat pair (male & female), 18 months old, great for meat production and breeding.',
    stock: 5,
    location: 'Musanze',
    imageURL: 'https://images.unsplash.com/photo-1506220926022-cc5c12acdb35?w=400',
  },
  {
    productName: 'Layer Hens (50 birds)',
    category: 'livestock' as const,
    price: 75000,
    discountPercent: 15,
    description: '50 fully grown ISA Brown layer hens, producing 45+ eggs per day. Ready for immediate transfer.',
    stock: 3,
    location: 'Huye',
    imageURL: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400',
  },
  {
    productName: 'Piglets (Landrace Breed)',
    category: 'livestock' as const,
    price: 45000,
    discountPercent: 0,
    description: 'Healthy Landrace piglets, 6 weeks old. Vaccinated, dewormed, and ready for raising.',
    stock: 10,
    location: 'Rubavu',
    imageURL: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  },
  {
    productName: 'German Shepherd Puppy',
    category: 'pet' as const,
    price: 90000,
    discountPercent: 0,
    description: 'Pure German Shepherd puppy, 8 weeks old. First vaccination done. Great family guard dog.',
    stock: 3,
    location: 'Kigali',
    imageURL: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400',
  },
  {
    productName: 'Maize Bran Animal Feed (50kg)',
    category: 'feed' as const,
    price: 8500,
    discountPercent: 5,
    description: 'Premium maize bran for dairy cows, goats, and pigs. Sourced fresh from Rulindo district.',
    stock: 100,
    location: 'Rulindo',
    imageURL: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400',
  },
  {
    productName: 'Newcastle Disease Vaccine (100 doses)',
    category: 'health' as const,
    price: 12000,
    discountPercent: 0,
    description: 'Newcastle disease vaccine for poultry, 100 doses. Keep refrigerated. Expiry 12 months.',
    stock: 50,
    location: 'Kigali',
    imageURL: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
  },
];

interface SeedResult {
  success: number;
  failed: number;
}

const SeedDataPanel: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<SeedResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (user?.role !== 'admin') return null;

  const handleSeed = async () => {
    setStatus('running');
    setResult(null);
    setErrorMsg('');

    let success = 0;
    let failed = 0;

    for (const p of SAMPLE_PRODUCTS) {
      try {
        await createProduct({ ...p, sellerId: user.uid });
        success++;
      } catch {
        failed++;
      }
    }

    if (failed > 0 && success === 0) {
      setStatus('error');
      setErrorMsg('All insertions failed. Make sure you are logged in as admin.');
    } else {
      setStatus('done');
      setResult({ success, failed });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-dashed border-gray-200 p-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <Database className="w-5 h-5 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 text-sm">Sample Products</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Insert {SAMPLE_PRODUCTS.length} demo products (livestock, feed, pet &amp; health) so the homepage Featured Deals section shows real listings.
          </p>

          {status === 'done' && result && (
            <div className="mt-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {result.success} product{result.success !== 1 ? 's' : ''} added successfully
              {result.failed > 0 && ` · ${result.failed} failed`}
            </div>
          )}

          {status === 'error' && (
            <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          <button
            onClick={handleSeed}
            disabled={status === 'running' || status === 'done'}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition"
          >
            {status === 'running' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {status === 'done' ? 'Products Added' : status === 'running' ? 'Adding…' : 'Add Sample Products'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeedDataPanel;
