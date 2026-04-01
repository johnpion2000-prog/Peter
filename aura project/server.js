require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbHelpers = require('./db_helpers');

const app = express();
const PORT = process.env.PORT || 3000;

// ------------------- Security & Middleware -------------------
// Disable CSP for development - enable inline scripts
app.use(helmet({
    contentSecurityPolicy: false
}));
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // serve static files

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// File upload (for proof)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, unique + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|gif|webp/;
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    const mime = allowedTypes.test(file.mimetype) && allowedTypes.test(ext);
    if (mime) return cb(null, true);
    cb(new Error('Invalid file type. Only JPG, PNG, PDF, GIF, WebP allowed.'));
};
const upload = multer({ 
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});
app.use('/uploads', express.static(uploadsDir));

// ------------------- Multer Error Handler -------------------
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size exceeds 10MB limit' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Too many files' });
        }
        return res.status(400).json({ error: 'Upload error: ' + err.message });
    } else if (err) {
        if (err.message.includes('Invalid file type')) {
            return res.status(400).json({ error: err.message });
        }
        return res.status(500).json({ error: 'Server error' });
    }
    next();
});

// ------------------- Authentication middleware -------------------
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    next();
};

// ------------------- Helper: validate input -------------------
const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(v => v.run(req)));
        const errors = validationResult(req);
        if (errors.isEmpty()) return next();
        res.status(400).json({ errors: errors.array() });
    };
};

// ------------------- Auth Routes -------------------
app.post('/api/auth/signup',
    validate([
        body('fullName').notEmpty().withMessage('Full name required'),
        body('email').isEmail().withMessage('Valid email required'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    ]),
    async (req, res) => {
        const { fullName, email, password, displayName } = req.body;
        console.log('📝 Signup request:', { fullName, email });

        try {
            // Check if user exists
            dbHelpers.getUserByEmail(email, async (err, user) => {
                if (err) {
                    console.error('❌ Error checking user:', err.message);
                    return res.status(500).json({ error: 'Database error: ' + err.message });
                }
                if (user) {
                    console.log('⚠️ Email already registered:', email);
                    return res.status(400).json({ error: 'Email already registered' });
                }

                const hashedPassword = await bcrypt.hash(password, 10);
                dbHelpers.createUser(fullName, email, hashedPassword, displayName || fullName.split(' ')[0], (err) => {
                    if (err) {
                        console.error('❌ Error creating user:', err.message);
                        return res.status(500).json({ error: 'Database error: ' + err.message });
                    }

                    // Get the created user
                    dbHelpers.getUserByEmail(email, (err, newUser) => {
                        if (err) {
                            console.error('❌ Error retrieving created user:', err.message);
                            return res.status(500).json({ error: 'Database error: ' + err.message });
                        }
                        
                        const token = jwt.sign({ id: newUser.id, role: newUser.role }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '7d' });
                        const { password_hash, ...userData } = newUser;
                        console.log('✓ Signup successful for:', email);
                        res.status(201).json({ token, user: userData });
                    });
                });
            });
        } catch (err) {
            console.error('❌ Signup error:', err);
            res.status(500).json({ error: 'Server error: ' + err.message });
        }
    }
);

app.post('/api/auth/login',
    validate([
        body('email').isEmail(),
        body('password').notEmpty()
    ]),
    async (req, res) => {
        const { email, password } = req.body;
        console.log('🔐 Login request:', { email });

        try {
            dbHelpers.getUserByEmail(email, async (err, user) => {
                if (err) {
                    console.error('❌ Error fetching user:', err.message);
                    return res.status(500).json({ error: 'Database error: ' + err.message });
                }
                if (!user) {
                    console.log('⚠️ User not found:', email);
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                const valid = await bcrypt.compare(password, user.password_hash);
                if (!valid) {
                    console.log('⚠️ Invalid password for:', email);
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                // Log sign-in
                const ip = req.ip || req.connection.remoteAddress;
                dbHelpers.logSignIn(user.id, ip, (err) => {
                    if (err) console.error('❌ Error logging sign-in:', err.message);
                });

                const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '7d' });
                const { password_hash, ...userData } = user;
                console.log('✓ Login successful for:', email);
                res.json({ token, user: userData });
            });
        } catch (err) {
            console.error('❌ Login error:', err.message);
            res.status(500).json({ error: 'Server error: ' + err.message });
        }
    }
);

// ------------------- User Routes -------------------
app.get('/api/user', authenticate, async (req, res) => {
    try {
        dbHelpers.getUserById(req.user.id, (err, user) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (!user) return res.status(404).json({ error: 'User not found' });
            res.json(user);
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/user', authenticate, validate([
    body('fullName').optional(),
    body('displayName').optional(),
    body('email').optional().isEmail()
]), async (req, res) => {
    const { fullName, displayName, email } = req.body;
    try {
        const updates = {};
        if (fullName) updates.full_name = fullName;
        if (displayName) updates.display_name = displayName;
        if (email) updates.email = email;

        if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No fields to update' });

        dbHelpers.updateUser(req.user.id, updates, (err) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            
            dbHelpers.getUserById(req.user.id, (err, user) => {
                if (err) return res.status(500).json({ error: 'Database error' });
                res.json({ success: true, user });
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ------------------- Transaction Routes -------------------
app.post('/api/transactions', authenticate, upload.single('proof'), async (req, res) => {
    const { recipient, amount, currency } = req.body;
    const proofFile = req.file ? req.file.filename : null;

    if (!recipient || !amount) {
        if (req.file) fs.unlink(path.join(uploadsDir, req.file.filename), () => {});
        return res.status(400).json({ error: 'Recipient and amount required' });
    }

    try {
        dbHelpers.createTransaction(req.user.id, recipient, parseFloat(amount), currency || 'CFA', proofFile ? 'uploaded' : 'pending', proofFile, (err, transaction) => {
            if (err) {
                if (req.file) fs.unlink(path.join(uploadsDir, req.file.filename), () => {});
                return res.status(500).json({ error: 'Database error: ' + err.message });
            }
            res.status(201).json({ success: true, transaction, message: 'Transaction uploaded successfully', proofUrl: proofFile ? `/uploads/${proofFile}` : null });
        });
    } catch (err) {
        if (req.file) fs.unlink(path.join(uploadsDir, req.file.filename), () => {});
        console.error(err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

app.get('/api/transactions', authenticate, async (req, res) => {
    try {
        dbHelpers.getUserTransactions(req.user.id, (err, transactions) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(transactions || []);
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ------------------- Admin Routes -------------------
app.get('/api/admin/users', authenticate, adminOnly, async (req, res) => {
    try {
        dbHelpers.getAllUsers((err, users) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(users || []);
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/admin/transactions', authenticate, adminOnly, async (req, res) => {
    try {
        dbHelpers.getAllTransactions((err, transactions) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(transactions || []);
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/admin/transactions/:id', authenticate, adminOnly, validate([
    body('status').isIn(['pending', 'uploaded', 'completed', 'failed', 'cancelled'])
]), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        dbHelpers.updateTransactionStatus(id, status, (err) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            
            // Log admin action
            dbHelpers.logAdminAction(req.user.id, 'update_transaction_status', 'transaction', id, JSON.stringify({ new_status: status }), () => {});

            dbHelpers.getTransactionById(id, (err, transaction) => {
                if (err) return res.status(500).json({ error: 'Database error' });
                if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
                res.json(transaction);
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ------------------- Error Handling -------------------
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// ------------------- Start Server -------------------
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
