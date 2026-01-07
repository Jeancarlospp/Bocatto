import Area from '../models/Area.js';
import { deleteAreaImage } from '../middleware/upload.js';

/**
 * Create new area
 * POST /areas
 * Protected: Admin only
 */
export const createArea = async (req, res) => {
  try {
    console.log('📝 Creating area - Request body:', req.body);
    console.log('📁 File received:', req.file);
    
    const { name, description, minCapacity, maxCapacity, features } = req.body;

    // Parse features if sent as string
    let parsedFeatures = features;
    if (typeof features === 'string') {
      try {
        parsedFeatures = JSON.parse(features);
      } catch (e) {
        parsedFeatures = features.split(',').map(f => f.trim());
      }
    }

    // Build image URL if file was uploaded to Cloudinary
    let imageUrl = null;
    if (req.file) {
      // Cloudinary returns the full URL in req.file.path
      imageUrl = req.file.path;
    }

    // Create area
    const area = await Area.create({
      name,
      description,
      minCapacity: Number(minCapacity),
      maxCapacity: Number(maxCapacity),
      features: parsedFeatures,
      imageUrl
    });

    return res.status(201).json({
      success: true,
      message: 'Area created successfully',
      data: area
    });

  } catch (error) {
    // Delete uploaded file if area creation fails
    if (req.file && req.file.path) {
      deleteAreaImage(req.file.path);
    }

    console.error('❌ Create area error:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error creating area'
    });
  }
};

/**
 * Get all areas
 * GET /areas
 * Query params: ?activeOnly=true (optional, for public view)
 */
export const getAllAreas = async (req, res) => {
  try {
    const { activeOnly } = req.query;

    // Build query filter
    const filter = {};
    if (activeOnly === 'true') {
      filter.isActive = true;
    }

    const areas = await Area.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: areas.length,
      data: areas
    });

  } catch (error) {
    console.error('Get all areas error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching areas'
    });
  }
};

/**
 * Get area by ID
 * GET /areas/:id
 */
export const getAreaById = async (req, res) => {
  try {
    const { id } = req.params;
    let area;

    // Try to find by incremental id first
    if (!isNaN(id)) {
      area = await Area.findOne({ id: parseInt(id) });
    }
    
    // If not found, try by MongoDB _id
    if (!area) {
      area = await Area.findById(id);
    }

    if (!area) {
      return res.status(404).json({
        success: false,
        message: 'Area not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: area
    });

  } catch (error) {
    console.error('Get area by ID error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid area ID'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error fetching area'
    });
  }
};

/**
 * Update area
 * PUT /areas/:id
 * Protected: Admin only
 */
export const updateArea = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, minCapacity, maxCapacity, features } = req.body;

    // Find existing area
    let area;
    if (!isNaN(id)) {
      area = await Area.findOne({ id: parseInt(id) });
    }
    if (!area) {
      area = await Area.findById(id);
    }

    if (!area) {
      // Delete uploaded file if exists
      if (req.file) {
        deleteAreaImage(`/uploads/areas/${req.file.filename}`);
      }

      return res.status(404).json({
        success: false,
        message: 'Area not found'
      });
    }

    // Parse features if needed
    let parsedFeatures = features;
    if (typeof features === 'string') {
      try {
        parsedFeatures = JSON.parse(features);
      } catch (e) {
        parsedFeatures = features.split(',').map(f => f.trim());
      }
    }

    // Update fields
    area.name = name || area.name;
    area.description = description || area.description;
    area.minCapacity = minCapacity ? Number(minCapacity) : area.minCapacity;
    area.maxCapacity = maxCapacity ? Number(maxCapacity) : area.maxCapacity;
    area.features = parsedFeatures || area.features;

    // Handle image update
    if (req.file) {
      // Delete old image from Cloudinary
      if (area.imageUrl) {
        await deleteAreaImage(area.imageUrl);
      }
      // Set new image (Cloudinary URL)
      area.imageUrl = req.file.path;
    }

    await area.save();

    return res.status(200).json({
      success: true,
      message: 'Area updated successfully',
      data: area
    });

  } catch (error) {
    // Delete uploaded file if update fails
    if (req.file && req.file.path) {
      await deleteAreaImage(req.file.path);
    }

    console.error('Update area error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid area ID'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error updating area'
    });
  }
};

/**
 * Delete area (Soft delete - sets isActive to false)
 * DELETE /areas/:id
 * Protected: Admin only
 * 
 * Note: Uses soft delete to preserve data integrity.
 * Areas are not physically deleted from database.
 */
export const deleteArea = async (req, res) => {
  try {
    const { id } = req.params;

    let area;
    if (!isNaN(id)) {
      area = await Area.findOne({ id: parseInt(id) });
    }
    if (!area) {
      area = await Area.findById(id);
    }

    if (!area) {
      return res.status(404).json({
        success: false,
        message: 'Area not found'
      });
    }

    // Soft delete: mark as inactive
    area.isActive = false;
    await area.save();

    return res.status(200).json({
      success: true,
      message: 'Area deleted successfully'
    });

  } catch (error) {
    console.error('Delete area error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid area ID'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error deleting area'
    });
  }
};

/**
 * Toggle area active status
 * PATCH /areas/:id/toggle-status
 * Protected: Admin only
 */
export const toggleAreaStatus = async (req, res) => {
  try {
    const { id } = req.params;

    let area;
    if (!isNaN(id)) {
      area = await Area.findOne({ id: parseInt(id) });
    }
    if (!area) {
      area = await Area.findById(id);
    }

    if (!area) {
      return res.status(404).json({
        success: false,
        message: 'Area not found'
      });
    }

    area.isActive = !area.isActive;
    await area.save();

    return res.status(200).json({
      success: true,
      message: `Area ${area.isActive ? 'activated' : 'deactivated'} successfully`,
      data: area
    });

  } catch (error) {
    console.error('Toggle area status error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid area ID'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error toggling area status'
    });
  }
};
