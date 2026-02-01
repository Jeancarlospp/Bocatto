import mongoose from 'mongoose';

// Counter schema for auto-incrementing IDs
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

/**
 * Contact Model
 * Represents contact messages submitted through the website
 * Collection: 'contacts' in MongoDB
 * 
 * Business Rules:
 * - All messages start with status 'new'
 * - Email must be valid format
 * - Company field is optional
 * - Messages can be marked as read, responded, or archived
 */
const contactSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format']
    },
    company: {
      type: String,
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
      default: null
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    status: {
      type: String,
      enum: ['new', 'read', 'responded', 'archived'],
      default: 'new',
      index: true
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [500, 'Admin notes cannot exceed 500 characters']
    },
    respondedAt: {
      type: Date
    },
    respondedBy: {
      type: Number, // Admin user ID
      ref: 'User'
    },
    ipAddress: {
      type: String,
      trim: true
    },
    userAgent: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    collection: 'contacts'
  }
);

/**
 * Auto-increment id before saving
 * Follows existing project pattern for ID generation
 */
contactSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'contactId',
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.id = counter.seq;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

/**
 * Index for efficient queries
 */
contactSchema.index({ createdAt: -1 }); // Sort by newest first
contactSchema.index({ status: 1, createdAt: -1 }); // Filter by status and date

/**
 * Virtual for checking if message is unread
 */
contactSchema.virtual('isUnread').get(function() {
  return this.status === 'new';
});

/**
 * Instance method to mark message as read
 */
contactSchema.methods.markAsRead = function() {
  if (this.status === 'new') {
    this.status = 'read';
  }
  return this.save();
};

/**
 * Instance method to mark message as responded
 */
contactSchema.methods.markAsResponded = function(adminId) {
  this.status = 'responded';
  this.respondedAt = new Date();
  this.respondedBy = adminId;
  return this.save();
};

/**
 * Static method to get unread count
 */
contactSchema.statics.getUnreadCount = function() {
  return this.countDocuments({ status: 'new' });
};

/**
 * Static method to get messages by status
 */
contactSchema.statics.getByStatus = function(status, limit = 50) {
  return this.find({ status })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-userAgent -ipAddress');
};

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
