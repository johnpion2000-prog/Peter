import React from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope, Scissors, GraduationCap, ClipboardList, Truck,
  CheckCircle2, Search, MessageCircle, ShoppingCart,
  MapPin, Mail, Phone, Package, Leaf, Wrench, ChevronRight,
  Layers, PawPrint, Pill, type LucideIcon,
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { formatCurrency } from '../utils/formatCurrency';
import { useCartStore } from '../stores/cartStore';
import Spinner from '../components/ui/Spinner';

/* ─────────────────────────────────────────
   SECTION DATA
───────────────────────────────────────── */
interface ServiceItem { icon: LucideIcon; title: string; description: string; action: string; href: string }

const services: ServiceItem[] = [
  { icon: Stethoscope, title: 'Veterinary Services', description: 'Connect with certified vets for check-ups, vaccinations, and emergency care for your animals.', action: 'Book Now', href: '/services?type=vet' },
  { icon: Scissors, title: 'Pet Grooming', description: 'Professional grooming services to keep your pets clean, healthy, and looking their best.', action: 'Book Now', href: '/services?type=groomer' },
  { icon: GraduationCap, title: 'Animal Training', description: 'Expert trainers for livestock obedience, working animals, and domestic pet behaviour.', action: 'Book Now', href: '/services?type=trainer' },
  { icon: ClipboardList, title: 'Farm Consultation', description: 'Get expert advice on farm management, breed selection, and productivity improvement.', action: 'Contact', href: '/services?type=consultant' },
  { icon: Truck, title: 'Animal Transport', description: 'Safe, stress-free transport of livestock and pets across Kigali and all Rwanda provinces.', action: 'Contact', href: '/services?type=transport' },
];

const whyUsItems = [
  'Trusted sellers & verified services',
  'Easy connection via WhatsApp',
  'Affordable listings for every budget',
  'All-in-one animal marketplace',
];

interface HowItWorksItem { step: string; icon: LucideIcon; title: string; description: string }
const howItWorks: HowItWorksItem[] = [
  { step: '01', icon: Search, title: 'Browse or Post', description: 'Find animals & services or list your own product in minutes — free to join.' },
  { step: '02', icon: MessageCircle, title: 'Connect', description: 'Message sellers or service providers directly via WhatsApp with one tap.' },
  { step: '03', icon: ShoppingCart, title: 'Buy or Book', description: 'Complete your purchase or service booking quickly and securely.' },
];

/* ─────────────────────────────────────────
   PAGE COMPONENT
───────────────────────────────────────── */
const HomePage: React.FC = () => {
  const { products, loading } = useProducts();
  const addItem = useCartStore((s) => s.addItem);

  // Show discounted products first; fall back to all latest when none exist
  const discounted = products.filter((p) => p.discountPercent > 0);
  const featured = (discounted.length > 0 ? discounted : products).slice(0, 6);
  const hasDeals = discounted.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── 1. HERO ── */}
      <section className="bg-gradient-to-br from-green-600 to-green-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-5">
            <Leaf className="w-3.5 h-3.5" />
            ZOOTRA MARKET
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Connecting Farmers, Pet Owners &amp; Trusted Services in One Place
          </h1>
          <p className="text-lg text-green-100 mb-8">
            Buy, sell, and access veterinary services, feed, and pet products — all in one trusted marketplace across Rwanda.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/products" className="bg-white text-green-700 font-semibold px-6 py-3 rounded-lg hover:bg-green-50 transition">Browse Animals</Link>
            <Link to="/register" className="border border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition">Start Selling</Link>
          </div>
        </div>
      </section>

      {/* ── 2. CATEGORIES ── */}
      <section className="bg-white py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-sm font-semibold text-green-600 tracking-widest uppercase">Explore</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Browse by Category</h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto text-sm">Find exactly what you need — from livestock to pet care products and animal health supplies.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* A. Livestock Products */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Layers className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-bold text-gray-800">Livestock Products</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-orange-400 flex-shrink-0" />Cattle (Milk, Meat, Butter)</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-orange-400 flex-shrink-0" />Goats (Meat &amp; Milk)</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-orange-400 flex-shrink-0" />Pig (Pork)</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-orange-400 flex-shrink-0" />Poultry (Eggs)</li>
              </ul>
              <Link to="/products?category=livestock" className="mt-auto text-sm font-semibold text-orange-600 hover:text-orange-700 transition flex items-center gap-1">
                Browse <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* B. Animal Feed */}
            <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="font-bold text-gray-800">Animal Feed</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-yellow-400 flex-shrink-0" />Concentrates</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-yellow-400 flex-shrink-0" />Supplements</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-yellow-400 flex-shrink-0" />Organic Feed</li>
              </ul>
              <Link to="/products?category=feed" className="mt-auto text-sm font-semibold text-yellow-700 hover:text-yellow-800 transition flex items-center gap-1">
                Browse <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* C. Pet Products */}
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <PawPrint className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-800">Pet Products</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-purple-400 flex-shrink-0" />Dog &amp; Cat Food</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-purple-400 flex-shrink-0" />Toys</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-purple-400 flex-shrink-0" />Accessories</li>
              </ul>
              <Link to="/products?category=pet" className="mt-auto text-sm font-semibold text-purple-600 hover:text-purple-700 transition flex items-center gap-1">
                Browse <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* D. Animal Health */}
            <div className="bg-green-50 border border-green-100 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Pill className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-800">Animal Health</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-green-400 flex-shrink-0" />Vaccines</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-green-400 flex-shrink-0" />Medicines</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-green-400 flex-shrink-0" />Supplements</li>
              </ul>
              <Link to="/products?category=health" className="mt-auto text-sm font-semibold text-green-600 hover:text-green-700 transition flex items-center gap-1">
                Browse <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3. FEATURED DEALS ── */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {hasDeals ? 'Featured Deals' : 'Latest Products'}
          </h2>
          <Link to="/products" className="text-green-600 hover:underline text-sm font-medium">View all →</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : featured.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">No products listed yet</p>
            <p className="text-sm text-gray-400 mt-1">Products added by sellers will appear here.</p>
            <Link to="/register" className="inline-block mt-4 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition">
              Start Selling
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                <Link to={`/products/${product.id}`}>
                  <img src={product.imageURL || '/placeholder.jpg'} alt={product.productName} className="w-full h-48 object-cover" />
                </Link>
                <div className="p-4">
                  {product.discountPercent > 0 && (
                    <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">-{product.discountPercent}%</span>
                  )}
                  <h3 className="font-semibold text-gray-800 mt-2">{product.productName}</h3>
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3 flex-shrink-0" /> {product.location}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-green-700 text-lg">{formatCurrency(product.discountedPrice)}</span>
                    {product.discountPercent > 0 && (
                      <span className="text-sm text-gray-400 line-through">{formatCurrency(product.price)}</span>
                    )}
                  </div>
                  <button onClick={() => addItem(product)} className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg transition">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── 5. CUSTOMER SERVICES ── */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-green-600 tracking-widest uppercase">What We Offer</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Customer Services</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">From veterinary care to animal transport — we connect you with trusted professionals across Rwanda.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc) => (
              <div key={svc.title} className="group bg-gray-50 hover:bg-green-50 border border-gray-100 hover:border-green-200 rounded-2xl p-6 flex flex-col gap-4 transition">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                  <svc.icon className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-800 mb-1">{svc.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{svc.description}</p>
                </div>
                <Link
                  to={svc.href}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-800 transition"
                >
                  {svc.action} <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. WHY CHOOSE US ── */}
      <section className="bg-green-700 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-sm font-semibold text-green-300 tracking-widest uppercase">Why ZOOTRA</span>
              <h2 className="text-3xl font-bold mt-2 mb-4">Built for Rwanda's Animal Market</h2>
              <p className="text-green-100 text-sm leading-relaxed">
                ZOOTRA is the simplest way to trade animals and access essential animal services in Rwanda. Whether you're a farmer, buyer, or service provider, we've got you covered.
              </p>
            </div>
            <ul className="space-y-4">
              {whyUsItems.map((text) => (
                <li key={text} className="flex items-center gap-3">
                  <CheckCircle2 className="flex-shrink-0 w-5 h-5 text-green-300" />
                  <span className="text-green-100 font-medium">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 7. HOW IT WORKS ── */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-green-600 tracking-widest uppercase">Simple Process</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* connector line (desktop only) */}
            <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-0.5 bg-green-200 -z-0" />
            {howItWorks.map(({ step, icon: Icon, title, description }) => (
              <div key={step} className="relative flex flex-col items-center text-center z-10">
                <div className="w-20 h-20 bg-white border-2 border-green-200 rounded-full flex flex-col items-center justify-center shadow-md mb-4">
                  <Icon className="w-7 h-7 text-green-600 mb-0.5" />
                  <span className="text-xs font-bold text-green-600">{step}</span>
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. CALL TO ACTION ── */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Start selling or find what you need today.</h2>
          <p className="text-gray-400 mb-10 text-sm">Join thousands of Rwandan farmers, buyers, and service providers already on ZOOTRA.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-8 py-3.5 rounded-xl transition text-sm shadow-lg"
            >
              <Package className="w-4 h-4" /> List a Product
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-900 font-semibold px-8 py-3.5 rounded-xl transition text-sm shadow-lg"
            >
              <Wrench className="w-4 h-4" /> Join as Service Provider
            </Link>
          </div>
        </div>
      </section>

      {/* ── 9. FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 pt-14 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Leaf className="w-6 h-6 text-green-500" />
                <span className="text-white text-lg font-bold">ZOOTRA</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-500">
                Rwanda's trusted marketplace for buying, selling, and accessing professional animal services — all in one place.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-widest">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/products" className="hover:text-green-400 transition">Browse Animals</Link></li>
                <li><Link to="/services" className="hover:text-green-400 transition">View Services</Link></li>
                <li><Link to="/register" className="hover:text-green-400 transition">Create Account</Link></li>
                <li><Link to="/login" className="hover:text-green-400 transition">Sign In</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-widest">Services</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Stethoscope className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" /><Link to="/services?type=vet" className="hover:text-green-400 transition">Veterinary</Link></li>
                <li className="flex items-center gap-2"><Scissors className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" /><Link to="/services?type=groomer" className="hover:text-green-400 transition">Grooming</Link></li>
                <li className="flex items-center gap-2"><GraduationCap className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" /><Link to="/services?type=trainer" className="hover:text-green-400 transition">Training</Link></li>
                <li className="flex items-center gap-2"><ClipboardList className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" /><Link to="/services?type=consultant" className="hover:text-green-400 transition">Consultation</Link></li>
                <li className="flex items-center gap-2"><Truck className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" /><Link to="/services?type=transport" className="hover:text-green-400 transition">Transport</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-widest">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span>Kigali, Rwanda<br /><span className="text-gray-600">Serving all provinces</span></span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <a href="mailto:hello@zootra.rw" className="hover:text-green-400 transition">hello@zootra.rw</a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <a href="tel:+250780000000" className="hover:text-green-400 transition">+250 780 000 000</a>
                </li>
              </ul>
              {/* Social Media */}
              <div className="flex gap-3 mt-5">
                <a href="https://wa.me/250780000000" target="_blank" rel="noreferrer"
                  className="w-9 h-9 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center text-xs font-bold text-gray-400 hover:text-white transition" title="WhatsApp">
                  WA
                </a>
                <a href="https://facebook.com/zootra" target="_blank" rel="noreferrer"
                  className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center text-xs font-bold text-gray-400 hover:text-white transition" title="Facebook">
                  FB
                </a>
                <a href="https://instagram.com/zootra" target="_blank" rel="noreferrer"
                  className="w-9 h-9 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center text-xs font-bold text-gray-400 hover:text-white transition" title="Instagram">
                  IG
                </a>
                <a href="https://twitter.com/zootra" target="_blank" rel="noreferrer"
                  className="w-9 h-9 bg-gray-800 hover:bg-sky-500 rounded-lg flex items-center justify-center text-xs font-bold text-gray-400 hover:text-white transition" title="Twitter / X">
                  X
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <p>© {new Date().getFullYear()} ZOOTRA Market. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="/privacy" className="hover:text-gray-400 transition">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-gray-400 transition">Terms of Service</Link>
              <Link to="/about" className="hover:text-gray-400 transition">About Us</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;
