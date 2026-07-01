import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, Phone, MapPin, Clock, Send, Leaf, MessageCircle,
  Stethoscope, CalendarCheck, ChevronRight,
} from 'lucide-react';

const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Build mailto link and open it — no backend required
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    );
    const subject = encodeURIComponent(form.subject || 'ZOOTRA Contact Form');
    window.location.href = `mailto:info@zootra.rw?subject=${subject}&body=${body}`;
    setTimeout(() => { setSending(false); setSent(true); }, 800);
  };

  const inputCls =
    'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white';

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-green-700 to-green-900 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-5">
            <Leaf className="w-3.5 h-3.5" /> Get in Touch
          </span>
          <h1 className="text-4xl font-bold mb-3">Contact ZOOTRA</h1>
          <p className="text-green-100 text-sm max-w-xl mx-auto">
            Have a question, need help with a booking, or want to list your services? We're here for you every day.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-14 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* ── Left: contact info ── */}
        <div className="space-y-6">

          {/* Info card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h2 className="font-bold text-gray-900 text-lg">Our Details</h2>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Email</p>
                <a href="mailto:info@zootra.rw" className="text-sm text-green-700 hover:underline font-medium">
                  info@zootra.rw
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Phone / WhatsApp</p>
                <a href="tel:+250780000000" className="text-sm text-green-700 hover:underline font-medium">
                  +250 780 000 000
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Location</p>
                <p className="text-sm text-gray-700">Kigali, Rwanda</p>
                <p className="text-xs text-gray-400">Serving all provinces</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Working Hours</p>
                <p className="text-sm text-gray-700">Mon – Sat: 7:00 AM – 7:00 PM</p>
                <p className="text-xs text-gray-400">Sunday: 9:00 AM – 5:00 PM</p>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
            <h2 className="font-bold text-gray-900 text-base mb-4">Quick Actions</h2>

            <Link
              to="/bookings"
              className="flex items-center gap-3 bg-green-50 hover:bg-green-100 border border-green-100 rounded-xl px-4 py-3 transition group"
            >
              <CalendarCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">Book a Service</p>
                <p className="text-xs text-gray-500">Vet, grooming, training & more</p>
              </div>
              <ChevronRight className="w-4 h-4 text-green-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <a
              href="https://wa.me/250780000000"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl px-4 py-3 transition group"
            >
              <MessageCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">Chat on WhatsApp</p>
                <p className="text-xs text-gray-500">Fastest response</p>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </a>

            <Link
              to="/bookings?service=vet"
              className="flex items-center gap-3 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl px-4 py-3 transition group"
            >
              <Stethoscope className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">Emergency Vet</p>
                <p className="text-xs text-gray-500">Book a vet appointment now</p>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ── Right: contact form ── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="font-bold text-gray-900 text-xl mb-1">Send us a Message</h2>
            <p className="text-sm text-gray-400 mb-6">We'll reply to your email within 24 hours.</p>

            {sent ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Send className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-sm text-gray-500 max-w-sm mb-6">
                  Your email client has opened with your message pre-filled. We'll get back to you at <span className="font-medium text-green-700">info@zootra.rw</span> within 24 hours.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  className="text-sm font-semibold text-green-700 hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full Name *</label>
                    <input
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email Address *</label>
                    <input
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Subject *</label>
                  <select
                    name="subject"
                    required
                    value={form.subject}
                    onChange={handleChange}
                    className={inputCls}
                  >
                    <option value="">Select a topic…</option>
                    <option value="Book a Service">Book a Service</option>
                    <option value="Product Inquiry">Product Inquiry</option>
                    <option value="Order Support">Order Support</option>
                    <option value="Become a Service Provider">Become a Service Provider</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Message *</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Describe your question or request in detail…"
                    className={`${inputCls} resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition text-sm"
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Opening email…' : 'Send Message'}
                </button>

                <p className="text-center text-xs text-gray-400">
                  Or email us directly at{' '}
                  <a href="mailto:info@zootra.rw" className="text-green-700 hover:underline font-medium">
                    info@zootra.rw
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
