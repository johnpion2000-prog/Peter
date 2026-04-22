import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarCheck, Clock, MapPin, FileText, Phone, Stethoscope, Scissors, GraduationCap, ClipboardList, Truck, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createBooking } from '../services/bookingService';
import { useUserBookings } from '../hooks/useBookings';
import { SERVICE_LABELS, ServiceType, BookingStatus } from '../types/booking.types';
import { useUIStore } from '../stores/uiStore';
import Spinner from '../components/ui/Spinner';
import { createReview, getUserReviewForSubject } from '../services/reviewService';
import StarRating from '../components/common/StarRating';

/* ── Form schema ── */
const bookingSchema = z.object({
  serviceType: z.enum(['vet', 'groomer', 'trainer', 'consultant', 'transport'] as const, {
    required_error: 'Please select a service',
  }),
  animalDescription: z.string().min(5, 'Describe the animal (min 5 characters)'),
  preferredDate: z.string().min(1, 'Select a date'),
  preferredTime: z.string().min(1, 'Select a time'),
  location: z.string().min(2, 'Enter your location'),
  userPhone: z.string().min(8, 'Enter a valid phone number'),
  notes: z.string().optional(),
});
type BookingFormData = z.infer<typeof bookingSchema>;

/* ── Helpers ── */
const serviceIcons: Record<ServiceType, React.ElementType> = {
  vet: Stethoscope, groomer: Scissors, trainer: GraduationCap,
  consultant: ClipboardList, transport: Truck,
};

const statusStyles: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusMessage: Record<BookingStatus, string> = {
  pending: 'Waiting for confirmation from our team.',
  confirmed: 'Your appointment is confirmed! Please be ready on the scheduled date.',
  completed: 'This appointment has been completed. Thank you!',
  cancelled: 'This booking was cancelled. You may book a new appointment.',
};

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white';

const Field: React.FC<{ label: string; error?: string; children: React.ReactNode }> = ({ label, error, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
  </div>
);

/* ── Inline Review Form for a single completed booking ── */
const BookingReviewForm: React.FC<{
  bookingId: string;
  serviceLabel: string;
  userId: string;
  userName: string;
  userEmail: string;
  onDone: () => void;
}> = ({ bookingId, serviceLabel, userId, userName, userEmail, onDone }) => {
  const showToast = useUIStore((s) => s.showToast);
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createReview({
        userId,
        userName,
        userEmail,
        subjectType: 'service',
        subjectId: bookingId,
        subjectName: serviceLabel,
        rating,
        comment: comment.trim(),
      });
      showToast('Review submitted! Thank you.', 'success');
      onDone();
    } catch {
      showToast('Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 bg-green-50 rounded-xl p-4 border border-green-100">
      <p className="text-xs font-semibold text-green-800 mb-2">Rate this appointment</p>
      <StarRating value={rating} onChange={setRating} size="md" />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder="How was your experience? (optional)"
        className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
      />
      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : 'Submit Review'}
        </button>
        <button type="button" onClick={onDone} className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition">
          Cancel
        </button>
      </div>
    </form>
  );
};

/* ── Booking card with review section ── */
const BookingCard: React.FC<{
  booking: ReturnType<typeof useUserBookings>['bookings'][number];
  user: { uid: string; displayName: string | null; email: string | null } | null;
}> = ({ booking: b, user }) => {
  const [reviewed, setReviewed] = React.useState<boolean | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const Icon = serviceIcons[b.serviceType];

  React.useEffect(() => {
    if (!user || b.status !== 'completed') return;
    getUserReviewForSubject(user.uid, b.id).then((r) => setReviewed(!!r));
  }, [user, b.id, b.status]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 items-start">
      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-green-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <h3 className="font-semibold text-gray-800">{SERVICE_LABELS[b.serviceType]}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[b.status]}`}>
            {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-0.5 truncate">{b.animalDescription}</p>
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1"><CalendarCheck className="w-3 h-3" />{b.preferredDate}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{b.preferredTime}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{b.location}</span>
        </div>
        <p className={`text-xs mt-2 px-2 py-1 rounded-lg font-medium ${statusStyles[b.status]}`}>
          {statusMessage[b.status]}
        </p>
        {b.notes && <p className="text-xs text-gray-400 mt-1 italic">"{b.notes}"</p>}

        {/* Review section — only for completed bookings */}
        {b.status === 'completed' && user && (
          <div className="mt-2">
            {reviewed === false && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="text-xs font-semibold text-green-700 border border-green-200 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-lg transition"
              >
                Leave a Review
              </button>
            )}
            {reviewed === true && (
              <p className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-lg inline-block">Review submitted</p>
            )}
            {showForm && (
              <BookingReviewForm
                bookingId={b.id}
                serviceLabel={SERVICE_LABELS[b.serviceType]}
                userId={user.uid}
                userName={user.displayName ?? 'Anonymous'}
                userEmail={user.email ?? ''}
                onDone={() => { setShowForm(false); setReviewed(true); }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Main component ── */
const BookingPage: React.FC = () => {
  const { user } = useAuth();
  const showToast = useUIStore((s) => s.showToast);
  const { bookings, loading, refetch } = useUserBookings(user?.uid);
  const [tab, setTab] = useState<'book' | 'history'>('book');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { serviceType: 'vet', notes: '' },
  });

  const onSubmit = async (data: BookingFormData) => {
    if (!user) return;
    try {
      await createBooking({
        userId: user.uid,
        userName: user.displayName ?? '',
        userEmail: user.email ?? '',
        userPhone: data.userPhone,
        serviceType: data.serviceType,
        animalDescription: data.animalDescription,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
        location: data.location,
        notes: data.notes ?? '',
        status: 'pending',
      });
      showToast('Appointment booked! We will confirm shortly.', 'success');
      reset();
      refetch();
      setTab('history');
    } catch (err: any) {
      showToast(err.message ?? 'Failed to create booking', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book an Appointment</h1>
          <p className="text-gray-500 mt-1 text-sm">Schedule veterinary care, grooming, training, consultation, or transport for your animals.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-8">
          {(['book', 'history'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${tab === t ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t === 'book' ? 'New Booking' : `My Bookings${bookings.length > 0 ? ` (${bookings.length})` : ''}`}
            </button>
          ))}
        </div>

        {/* ── BOOKING FORM ── */}
        {tab === 'book' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* Service type */}
              <Field label="Service Type" error={errors.serviceType?.message}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                  {(Object.entries(SERVICE_LABELS) as [ServiceType, string][]).map(([val, label]) => {
                    const Icon = serviceIcons[val];
                    return (
                      <label key={val} className="relative cursor-pointer">
                        <input type="radio" value={val} {...register('serviceType')} className="sr-only peer" />
                        <div className="flex items-center gap-2 border-2 border-gray-200 peer-checked:border-green-500 peer-checked:bg-green-50 rounded-xl px-3 py-2.5 transition">
                          <Icon className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-700">{label}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </Field>

              {/* Animal description */}
              <Field label="Animal Description" error={errors.animalDescription?.message}>
                <input {...register('animalDescription')} placeholder="e.g. 2-year-old dairy cow, showing signs of fever" className={inputCls} />
              </Field>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Preferred Date" error={errors.preferredDate?.message}>
                  <div className="relative">
                    <CalendarCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="date" min={tomorrow()} {...register('preferredDate')} className={`${inputCls} pl-9`} />
                  </div>
                </Field>
                <Field label="Preferred Time" error={errors.preferredTime?.message}>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="time" {...register('preferredTime')} className={`${inputCls} pl-9`} />
                  </div>
                </Field>
              </div>

              {/* Location & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Your Location" error={errors.location?.message}>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input {...register('location')} placeholder="e.g. Kigali, Remera" className={`${inputCls} pl-9`} />
                  </div>
                </Field>
                <Field label="Phone Number" error={errors.userPhone?.message}>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input {...register('userPhone')} placeholder="+250 780 000 000" className={`${inputCls} pl-9`} />
                  </div>
                </Field>
              </div>

              {/* Notes */}
              <Field label="Additional Notes (optional)" error={errors.notes?.message}>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea rows={3} {...register('notes')} placeholder="Any extra details the service provider should know…" className={`${inputCls} pl-9`} />
                </div>
              </Field>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm"
              >
                {isSubmitting ? <Spinner size="sm" /> : <><CalendarCheck className="w-4 h-4" /> Confirm Booking</>}
              </button>
            </form>
          </div>
        )}

        {/* ── BOOKING HISTORY ── */}
        {tab === 'history' && (
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-16"><Spinner size="lg" /></div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="font-semibold text-gray-500">No bookings yet</p>
                <p className="text-sm text-gray-400 mt-1">Your appointment history will appear here.</p>
                <button onClick={() => setTab('book')} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-700">
                  Book now <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              bookings.map((b) => (
                <BookingCard key={b.id} booking={b} user={user} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
