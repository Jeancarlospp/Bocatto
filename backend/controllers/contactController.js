import Contact from '../models/Contact.js';

/**
 * Contact Controller
 * Handles contact form submissions and message management
 * Follows Clean Code and Single Responsibility Principle
 */

/**
 * Create new contact message
 * Public endpoint - no authentication required
 * POST /api/contact
 */
export const createContactMessage = async (req, res) => {
  try {
    const { name, email, company, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate field lengths
    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters'
      });
    }

    if (message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Message must be at least 10 characters'
      });
    }

    if (message.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot exceed 1000 characters'
      });
    }

    // Create contact message with metadata
    const contact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company ? company.trim() : null,
      message: message.trim(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will contact you soon.',
      data: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        createdAt: contact.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating contact message:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error sending message. Please try again later.'
    });
  }
};

/**
 * Get all contact messages
 * Admin only endpoint
 * GET /api/contact
 */
export const getAllContactMessages = async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;

    // Build query
    const query = {};
    if (status && ['new', 'read', 'responded', 'archived'].includes(status)) {
      query.status = status;
    }

    // Calculate pagination
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;

    // Get messages with pagination
    const messages = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip)
      .select('-ipAddress -userAgent');

    // Get total count for pagination
    const totalCount = await Contact.countDocuments(query);
    const unreadCount = await Contact.getUnreadCount();

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalMessages: totalCount,
          messagesPerPage: limitNum
        },
        unreadCount
      }
    });

  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
};

/**
 * Get single contact message by ID
 * Admin only endpoint
 * GET /api/contact/:id
 */
export const getContactMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Contact.findOne({ id: parseInt(id) });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Auto-mark as read when admin views it
    if (message.status === 'new') {
      await message.markAsRead();
    }

    res.json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Error fetching contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching message'
    });
  }
};

/**
 * Update contact message status
 * Admin only endpoint
 * PATCH /api/contact/:id/status
 */
export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    // Validate status
    if (!['new', 'read', 'responded', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const message = await Contact.findOne({ id: parseInt(id) });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Update status
    message.status = status;
    
    if (adminNotes) {
      message.adminNotes = adminNotes.trim();
    }

    // Mark as responded if status is 'responded'
    if (status === 'responded' && req.user) {
      message.respondedAt = new Date();
      message.respondedBy = req.user.id;
    }

    await message.save();

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: message
    });

  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status'
    });
  }
};

/**
 * Delete contact message
 * Admin only endpoint
 * DELETE /api/contact/:id
 */
export const deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Contact.findOneAndDelete({ id: parseInt(id) });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message'
    });
  }
};

/**
 * Get contact statistics
 * Admin only endpoint
 * GET /api/contact/stats
 */
export const getContactStats = async (req, res) => {
  try {
    const totalMessages = await Contact.countDocuments();
    const newMessages = await Contact.countDocuments({ status: 'new' });
    const readMessages = await Contact.countDocuments({ status: 'read' });
    const respondedMessages = await Contact.countDocuments({ status: 'responded' });
    const archivedMessages = await Contact.countDocuments({ status: 'archived' });

    // Get recent messages (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentMessages = await Contact.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalMessages,
        messagesByStatus: {
          new: newMessages,
          read: readMessages,
          responded: respondedMessages,
          archived: archivedMessages
        },
        recentMessages: {
          count: recentMessages,
          period: 'Last 7 days'
        }
      }
    });

  } catch (error) {
    console.error('Error fetching contact stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
};
