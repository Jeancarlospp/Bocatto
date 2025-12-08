import Offer from '../models/Offer.js';
import { deleteOfferImage } from '../middleware/upload.js';

/**
 * Create new offer
 * POST /offers
 * Protected: Admin only
 */
export const createOffer = async (req, res) => {
  try {
    console.log('📝 Creating offer - Request body:', req.body);
    console.log('📁 File received:', req.file);
    
    const { 
      name, 
      description, 
      items, 
      originalPrice, 
      offerPrice, 
      validDays, 
      startDate, 
      endDate, 
      startTime, 
      endTime, 
      badge, 
      featured, 
      active, 
      maxUsage 
    } = req.body;

    // Parse items if sent as string
    let parsedItems = items;
    if (typeof items === 'string') {
      try {
        parsedItems = JSON.parse(items);
      } catch (e) {
        console.error('Error parsing items:', e);
        return res.status(400).json({
          success: false,
          message: 'Invalid items format'
        });
      }
    }

    // Parse validDays if sent as string
    let parsedValidDays = validDays;
    if (typeof validDays === 'string') {
      try {
        parsedValidDays = JSON.parse(validDays);
      } catch (e) {
        parsedValidDays = validDays.split(',').map(d => d.trim());
      }
    }

    // Parse badge if sent as string
    let parsedBadge = badge;
    if (typeof badge === 'string') {
      try {
        parsedBadge = JSON.parse(badge);
      } catch (e) {
        parsedBadge = { text: badge };
      }
    }

    // Build image URL if file was uploaded to Cloudinary
    let imageUrl = null;
    if (req.file) {
      imageUrl = req.file.path;
    }

    // Create offer
    const offer = await Offer.create({
      name,
      description,
      items: parsedItems,
      originalPrice: Number(originalPrice),
      offerPrice: Number(offerPrice),
      validDays: parsedValidDays,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      badge: parsedBadge,
      imageUrl: imageUrl,
      featured: featured === 'true' || featured === true,
      active: active !== 'false' && active !== false
    });

    return res.status(201).json({
      success: true,
      message: 'Offer created successfully',
      data: offer
    });

  } catch (error) {
    console.error('❌ Create offer error:', error);
    
    // Delete uploaded file if offer creation fails
    if (req.file && req.file.path) {
      try {
        await deleteOfferImage(req.file.path);
      } catch (deleteError) {
        console.error('❌ Error deleting uploaded file:', deleteError);
      }
    }

    return res.status(400).json({
      success: false,
      message: error.message || 'Error creating offer'
    });
  }
};

/**
 * Get all offers
 * GET /offers
 * Public
 */
export const getAllOffers = async (req, res) => {
  try {
    // Simple query like products - no filters for admin panel
    const offers = await Offer.find().sort({ createdAt: 1 });

    // Auto-assign offerId to offers without ID (same logic as products)
    const updates = [];
    const offersWithId = offers.map((offer, index) => {
      const obj = offer.toObject();
      if (!obj.offerId || obj.offerId === 0) {
        obj.offerId = index + 1;
        updates.push({
          updateOne: {
            filter: { _id: offer._id },
            update: { $set: { offerId: index + 1 } }
          }
        });
      }
      return obj;
    });
    
    if (updates.length > 0) {
      await Offer.bulkWrite(updates);
    }

    return res.status(200).json({
      success: true,
      count: offersWithId.length,
      data: offersWithId
    });

  } catch (error) {
    console.error('❌ Get offers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching offers'
    });
  }
};

/**
 * Get offer by ID
 * GET /offers/:id
 * Public
 */
export const getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: offer
    });

  } catch (error) {
    console.error('❌ Get offer by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching offer'
    });
  }
};

/**
 * Update offer
 * PUT /offers/:id
 * Protected: Admin only
 */
export const updateOffer = async (req, res) => {
  try {
    console.log('✏️ Updating offer - Request body:', req.body);
    console.log('📁 File received:', req.file);

    const { 
      name, 
      description, 
      items, 
      originalPrice, 
      offerPrice, 
      validDays, 
      startDate, 
      endDate, 
      badge, 
      featured, 
      active 
    } = req.body;

    // Find existing offer
    const existingOffer = await Offer.findById(req.params.id);
    if (!existingOffer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    // Parse complex fields
    let parsedItems = items;
    if (typeof items === 'string') {
      try {
        parsedItems = JSON.parse(items);
      } catch (e) {
        parsedItems = existingOffer.items;
      }
    }

    let parsedValidDays = validDays;
    if (typeof validDays === 'string') {
      try {
        parsedValidDays = JSON.parse(validDays);
      } catch (e) {
        parsedValidDays = validDays.split(',').map(d => d.trim());
      }
    }

    let parsedBadge = badge;
    if (typeof badge === 'string') {
      try {
        parsedBadge = JSON.parse(badge);
      } catch (e) {
        parsedBadge = existingOffer.badge;
      }
    }

    // Handle image upload
    let imageUrl = existingOffer.imageUrl;
    if (req.file) {
      // Delete old image if it exists
      if (existingOffer.imageUrl) {
        try {
          await deleteOfferImage(existingOffer.imageUrl);
        } catch (deleteError) {
          console.error('⚠️ Could not delete old image:', deleteError);
        }
      }
      imageUrl = req.file.path;
    }

    // Update offer
    const updatedOffer = await Offer.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        items: parsedItems,
        originalPrice: originalPrice ? Number(originalPrice) : existingOffer.originalPrice,
        offerPrice: offerPrice ? Number(offerPrice) : existingOffer.offerPrice,
        validDays: parsedValidDays,
        startDate: startDate ? new Date(startDate) : existingOffer.startDate,
        endDate: endDate ? new Date(endDate) : existingOffer.endDate,
        badge: parsedBadge,
        imageUrl: imageUrl,
        featured: featured !== undefined ? (featured === 'true' || featured === true) : existingOffer.featured,
        active: active !== undefined ? (active !== 'false' && active !== false) : existingOffer.active
      },
      { 
        new: true, 
        runValidators: true 
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Offer updated successfully',
      data: updatedOffer
    });

  } catch (error) {
    console.error('❌ Update offer error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Error updating offer'
    });
  }
};

/**
 * Delete offer
 * DELETE /offers/:id
 * Protected: Admin only
 */
export const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    // Delete image from Cloudinary if it exists
    if (offer.imageUrl) {
      try {
        await deleteOfferImage(offer.imageUrl);
      } catch (deleteError) {
        console.error('⚠️ Could not delete offer image:', deleteError);
      }
    }

    // Delete offer from database
    await Offer.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Offer deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete offer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting offer'
    });
  }
};

