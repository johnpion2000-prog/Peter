"use strict";
/**
 * ZOOTRA Market — Email & Notification Cloud Functions (2nd Gen)
 *
 * Triggers:
 *  1. onOrderCreated         → emails admin when a new order is placed
 *  2. onBookingCreated       → emails admin when a new booking is submitted
 *  3. onOrderStatusChanged   → emails the customer when order is delivered or cancelled
 *  4. onBookingStatusChanged → emails the customer when booking is confirmed, completed, or cancelled
 *
 * Before deploying, set secrets:
 *   firebase functions:secrets:set EMAIL_USER   (Gmail address to send from)
 *   firebase functions:secrets:set EMAIL_PASS   (Gmail App Password)
 *   firebase functions:secrets:set ADMIN_EMAIL  (receives new-order/booking alerts)
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onBookingStatusChanged = exports.onOrderStatusChanged = exports.onBookingCreated = exports.onOrderCreated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const params_1 = require("firebase-functions/params");
const admin = __importStar(require("firebase-admin"));
const nodemailer = __importStar(require("nodemailer"));
admin.initializeApp();
const EMAIL_USER = (0, params_1.defineSecret)('EMAIL_USER');
const EMAIL_PASS = (0, params_1.defineSecret)('EMAIL_PASS');
const ADMIN_EMAIL = (0, params_1.defineSecret)('ADMIN_EMAIL');
const FROM_NAME = '"ZOOTRA Market" <info@zootra.rw>';
const SERVICE_LABELS = {
    vet: 'Veterinary', groomer: 'Pet Grooming', trainer: 'Animal Training',
    consultant: 'Farm Consultation', transport: 'Animal Transport',
};
function makeTransporter(user, pass) {
    return nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
}
async function sendMail(emailUser, emailPass, to, subject, html) {
    try {
        await makeTransporter(emailUser, emailPass).sendMail({ from: FROM_NAME, to, subject, html });
        console.log(`Email sent to ${to}`);
    }
    catch (err) {
        console.error(`Email failed to ${to}`, err);
    }
}
function baseTemplate(title, body) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}
.wrapper{max-width:580px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)}
.header{background:#16a34a;padding:28px 32px;text-align:center}
.header h1{color:#fff;margin:0;font-size:22px;letter-spacing:1px}
.header p{color:#bbf7d0;margin:4px 0 0;font-size:13px}
.body{padding:28px 32px;color:#374151;font-size:14px;line-height:1.6}
.body h2{color:#111827;font-size:18px;margin-top:0}
table.d{width:100%;border-collapse:collapse;margin:16px 0}
table.d td{padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px}
table.d td:first-child{font-weight:600;color:#6b7280;width:40%}
.badge{display:inline-block;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700}
.bg{background:#dcfce7;color:#15803d}.br{background:#fee2e2;color:#b91c1c}
.by{background:#fef9c3;color:#854d0e}.bb{background:#dbeafe;color:#1d4ed8}
.cta{display:inline-block;margin-top:20px;padding:12px 28px;background:#16a34a;color:#fff!important;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px}
.footer{background:#f9fafb;padding:16px 32px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb}
</style></head><body>
<div class="wrapper">
<div class="header"><h1>ZOOTRA</h1><p>${title}</p></div>
<div class="body">${body}</div>
<div class="footer">ZOOTRA Market · Kigali, Rwanda · <a href="mailto:info@zootra.rw" style="color:#16a34a">info@zootra.rw</a></div>
</div></body></html>`;
}
/* ═══════════════════════════════════════
   1. NEW ORDER → alert admin
═══════════════════════════════════════ */
exports.onOrderCreated = (0, firestore_1.onDocumentCreated)({ document: 'orders/{orderId}', secrets: [EMAIL_USER, EMAIL_PASS, ADMIN_EMAIL] }, async (event) => {
    var _a, _b, _c, _d;
    const order = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    if (!order)
        return;
    const id = event.params.orderId;
    const short = id.slice(0, 8).toUpperCase();
    const items = order.items
        .map((i) => { var _a, _b; return `<li>${(_b = (_a = i.product) === null || _a === void 0 ? void 0 : _a.productName) !== null && _b !== void 0 ? _b : 'Product'} &times; ${i.quantity}</li>`; })
        .join('');
    const html = baseTemplate('New Order Received', `<h2>New Order #${short}</h2>
       <p>A customer placed a new order on ZOOTRA Market.</p>
       <table class="d">
         <tr><td>Order ID</td><td>#${short}</td></tr>
         <tr><td>Customer ID</td><td>${(_b = order.userId) !== null && _b !== void 0 ? _b : '—'}</td></tr>
         <tr><td>Address</td><td>${(_c = order.shippingAddress) !== null && _c !== void 0 ? _c : '—'}</td></tr>
         <tr><td>Total</td><td><strong>${Number((_d = order.total) !== null && _d !== void 0 ? _d : 0).toLocaleString()} RWF</strong></td></tr>
         <tr><td>Status</td><td><span class="badge by">Pending</span></td></tr>
       </table>
       <p><strong>Items:</strong></p><ul>${items}</ul>
       <a href="https://zootra-61405.web.app/admin/orders" class="cta">View in Admin Panel</a>`);
    const to = ADMIN_EMAIL.value() || 'info@zootra.rw';
    await sendMail(EMAIL_USER.value(), EMAIL_PASS.value(), to, `New Order #${short} — ZOOTRA Market`, html);
});
/* ═══════════════════════════════════════
   2. NEW BOOKING → alert admin
═══════════════════════════════════════ */
exports.onBookingCreated = (0, firestore_1.onDocumentCreated)({ document: 'bookings/{bookingId}', secrets: [EMAIL_USER, EMAIL_PASS, ADMIN_EMAIL] }, async (event) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const b = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    if (!b)
        return;
    const id = event.params.bookingId;
    const short = id.slice(0, 8).toUpperCase();
    const svc = (_b = SERVICE_LABELS[b.serviceType]) !== null && _b !== void 0 ? _b : b.serviceType;
    const html = baseTemplate('New Booking Submitted', `<h2>New Booking #${short}</h2>
       <p>A customer submitted a new service booking.</p>
       <table class="d">
         <tr><td>Booking ID</td><td>#${short}</td></tr>
         <tr><td>Customer</td><td>${(_c = b.userName) !== null && _c !== void 0 ? _c : '—'} (${(_d = b.userEmail) !== null && _d !== void 0 ? _d : '—'})</td></tr>
         <tr><td>Phone</td><td>${(_e = b.userPhone) !== null && _e !== void 0 ? _e : '—'}</td></tr>
         <tr><td>Service</td><td>${svc}</td></tr>
         <tr><td>Animal</td><td>${(_f = b.animalDescription) !== null && _f !== void 0 ? _f : '—'}</td></tr>
         <tr><td>Date &amp; Time</td><td>${b.preferredDate} at ${b.preferredTime}</td></tr>
         <tr><td>Location</td><td>${(_g = b.location) !== null && _g !== void 0 ? _g : '—'}</td></tr>
         <tr><td>Notes</td><td>${b.notes || '—'}</td></tr>
         <tr><td>Status</td><td><span class="badge by">Pending</span></td></tr>
       </table>
       <a href="https://zootra-61405.web.app/admin/bookings" class="cta">Manage in Admin Panel</a>`);
    const to = ADMIN_EMAIL.value() || 'info@zootra.rw';
    await sendMail(EMAIL_USER.value(), EMAIL_PASS.value(), to, `New Booking — ${svc} from ${(_h = b.userName) !== null && _h !== void 0 ? _h : 'Customer'}`, html);
});
/* ═══════════════════════════════════════
   3. ORDER STATUS CHANGED → email customer
═══════════════════════════════════════ */
exports.onOrderStatusChanged = (0, firestore_1.onDocumentUpdated)({ document: 'orders/{orderId}', secrets: [EMAIL_USER, EMAIL_PASS] }, async (event) => {
    var _a, _b, _c, _d, _e, _f;
    const before = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
    const after = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
    if (!before || !after || before.status === after.status)
        return;
    const newStatus = after.status;
    if (newStatus !== 'delivered' && newStatus !== 'cancelled')
        return;
    const id = event.params.orderId;
    const short = id.slice(0, 8).toUpperCase();
    let customerEmail = (_c = after.userEmail) !== null && _c !== void 0 ? _c : '';
    if (!customerEmail && after.userId) {
        const snap = await admin.firestore().collection('users').doc(after.userId).get();
        customerEmail = (_e = (_d = snap.data()) === null || _d === void 0 ? void 0 : _d.email) !== null && _e !== void 0 ? _e : '';
    }
    if (!customerEmail)
        return;
    const delivered = newStatus === 'delivered';
    const items = after.items
        .map((i) => { var _a, _b; return `<li>${(_b = (_a = i.product) === null || _a === void 0 ? void 0 : _a.productName) !== null && _b !== void 0 ? _b : 'Product'} &times; ${i.quantity}</li>`; })
        .join('');
    const html = baseTemplate(delivered ? 'Order Delivered' : 'Order Cancelled', `<h2>${delivered ? 'Your order has been delivered!' : 'Your order has been cancelled'}</h2>
       <p>${delivered
        ? 'Great news! Your order was successfully delivered. Thank you for shopping with ZOOTRA.'
        : 'Your order was cancelled. Questions? Email <a href="mailto:info@zootra.rw">info@zootra.rw</a>.'}</p>
       <table class="d">
         <tr><td>Order ID</td><td>#${short}</td></tr>
         <tr><td>Total</td><td>${Number((_f = after.total) !== null && _f !== void 0 ? _f : 0).toLocaleString()} RWF</td></tr>
         <tr><td>Status</td><td><span class="badge ${delivered ? 'bg' : 'br'}">${delivered ? 'Delivered' : 'Cancelled'}</span></td></tr>
       </table>
       <p><strong>Items:</strong></p><ul>${items}</ul>
       <a href="https://zootra-61405.web.app/orders" class="cta">${delivered ? 'View My Orders' : 'Shop Again'}</a>`);
    await sendMail(EMAIL_USER.value(), EMAIL_PASS.value(), customerEmail, delivered
        ? `Your ZOOTRA order #${short} has been delivered`
        : `Your ZOOTRA order #${short} was cancelled`, html);
});
/* ═══════════════════════════════════════
   4. BOOKING STATUS CHANGED → email customer
═══════════════════════════════════════ */
exports.onBookingStatusChanged = (0, firestore_1.onDocumentUpdated)({ document: 'bookings/{bookingId}', secrets: [EMAIL_USER, EMAIL_PASS] }, async (event) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const before = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
    const after = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
    if (!before || !after || before.status === after.status)
        return;
    const newStatus = after.status;
    if (!['confirmed', 'completed', 'cancelled'].includes(newStatus))
        return;
    const id = event.params.bookingId;
    const short = id.slice(0, 8).toUpperCase();
    const customerEmail = (_c = after.userEmail) !== null && _c !== void 0 ? _c : '';
    if (!customerEmail)
        return;
    const svc = (_d = SERVICE_LABELS[after.serviceType]) !== null && _d !== void 0 ? _d : after.serviceType;
    const cfg = {
        confirmed: {
            badge: 'bb',
            headline: 'Your booking is confirmed!',
            message: 'Great news! Your appointment is confirmed. Please be ready at the scheduled date and time.',
        },
        completed: {
            badge: 'bg',
            headline: 'Appointment completed!',
            message: 'Your appointment has been completed. Thank you for using ZOOTRA services!',
        },
        cancelled: {
            badge: 'br',
            headline: 'Your booking was cancelled',
            message: 'Your appointment was cancelled. To re-book, contact us at <a href="mailto:info@zootra.rw">info@zootra.rw</a>.',
        },
    };
    const { badge, headline, message } = cfg[newStatus];
    const html = baseTemplate(headline, `<h2>${headline}</h2>
       <p>Hi ${(_e = after.userName) !== null && _e !== void 0 ? _e : 'there'},</p>
       <p>${message}</p>
       <table class="d">
         <tr><td>Booking ID</td><td>#${short}</td></tr>
         <tr><td>Service</td><td>${svc}</td></tr>
         <tr><td>Animal</td><td>${(_f = after.animalDescription) !== null && _f !== void 0 ? _f : '—'}</td></tr>
         <tr><td>Date &amp; Time</td><td>${after.preferredDate} at ${after.preferredTime}</td></tr>
         <tr><td>Location</td><td>${(_g = after.location) !== null && _g !== void 0 ? _g : '—'}</td></tr>
         <tr><td>Status</td><td><span class="badge ${badge}">${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</span></td></tr>
       </table>
       <a href="https://zootra-61405.web.app/bookings" class="cta">View My Bookings</a>`);
    await sendMail(EMAIL_USER.value(), EMAIL_PASS.value(), customerEmail, `ZOOTRA — ${svc} appointment ${newStatus}`, html);
});
//# sourceMappingURL=index.js.map