import Location from '../models/Location.js';
import { deleteLocationImage } from '../middleware/upload.js';

/**
 * Create new location
 * POST /locations
 * Protected: Admin only
 */
export const createLocation = async (req, res) => {
  try {
    console.log('📝 Creating location - Request body:', req.body);
    console.log('📁 File received:', req.file);
    
    const { 
      name, 
      address, 
      city, 
      phone, 
      email,
      lat,
      lng,
      description,
      isFlagship,
      openingHours
    } = req.body;

    // Build image URL if file was uploaded to Cloudinary
    let imageUrl = null;
    if (req.file) {
      imageUrl = req.file.path;
    }

    // Parse opening hours if sent as string
    let parsedOpeningHours = openingHours;
    if (typeof openingHours === 'string') {
      try {
        parsedOpeningHours = JSON.parse(openingHours);
      } catch (e) {
        console.log('Using default opening hours');
        parsedOpeningHours = undefined;
      }
    }

    // Create location
    const location = await Location.create({
      name,
      address,
      city,
      phone,
      email: email || undefined,
      coordinates: {
        lat: Number(lat),
        lng: Number(lng)
      },
      description: description || undefined,
      isFlagship: isFlagship === 'true' || isFlagship === true,
      openingHours: parsedOpeningHours,
      imageUrl
    });

    return res.status(201).json({
      success: true,
      message: 'Location created successfully',
      data: location
    });

  } catch (error) {
    // Delete uploaded file if location creation fails
    if (req.file && req.file.path) {
      deleteLocationImage(req.file.path);
    }

    console.error('❌ Create location error:', error);
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
      message: 'Error creating location'
    });
  }
};

/**
 * Get all locations
 * GET /locations
 * Query params: ?activeOnly=true (optional, for public view)
 */
export const getAllLocations = async (req, res) => {
  try {
    const { activeOnly, city } = req.query;

    // Build query filter
    const filter = {};
    if (activeOnly === 'true') {
      filter.isActive = true;
    }
    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }

    const locations = await Location.find(filter).sort({ isFlagship: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: locations.length,
      data: locations
    });

  } catch (error) {
    console.error('Get all locations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching locations'
    });
  }
};

/**
 * Get location by ID
 * GET /locations/:id
 */
export const getLocationById = async (req, res) => {
  try {
    const { id } = req.params;
    let location;

    // Try to find by incremental id first
    if (!isNaN(id)) {
      location = await Location.findOne({ id: parseInt(id) });
    }
    
    // If not found, try by MongoDB _id
    if (!location) {
      location = await Location.findById(id);
    }

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: location
    });

  } catch (error) {
    console.error('Get location by ID error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid location ID'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error fetching location'
    });
  }
};

/**
 * Update location
 * PUT /locations/:id
 * Protected: Admin only
 */
export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📝 Updating location:', id);
    console.log('📝 Update data:', req.body);
    console.log('📁 File received:', req.file);

    let location;
    if (!isNaN(id)) {
      location = await Location.findOne({ id: parseInt(id) });
    } else {
      location = await Location.findById(id);
    }

    if (!location) {
      if (req.file && req.file.path) {
        deleteLocationImage(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    const { 
      name, 
      address, 
      city, 
      phone, 
      email,
      lat,
      lng,
      description,
      isFlagship,
      openingHours,
      isActive
    } = req.body;

    // Update fields
    if (name) location.name = name;
    if (address) location.address = address;
    if (city) location.city = city;
    if (phone) location.phone = phone;
    if (email !== undefined) location.email = email || undefined;
    if (lat && lng) {
      location.coordinates = {
        lat: Number(lat),
        lng: Number(lng)
      };
    }
    if (description !== undefined) location.description = description || undefined;
    if (isFlagship !== undefined) location.isFlagship = isFlagship === 'true' || isFlagship === true;
    if (isActive !== undefined) location.isActive = isActive === 'true' || isActive === true;

    // Parse opening hours if sent as string
    if (openingHours) {
      let parsedOpeningHours = openingHours;
      if (typeof openingHours === 'string') {
        try {
          parsedOpeningHours = JSON.parse(openingHours);
        } catch (e) {
          console.log('Error parsing opening hours');
        }
      }
      if (parsedOpeningHours) {
        location.openingHours = parsedOpeningHours;
      }
    }

    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (location.imageUrl) {
        deleteLocationImage(location.imageUrl);
      }
      location.imageUrl = req.file.path;
    }

    await location.save();

    return res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: location
    });

  } catch (error) {
    if (req.file && req.file.path) {
      deleteLocationImage(req.file.path);
    }

    console.error('❌ Update location error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error updating location'
    });
  }
};

/**
 * Delete location (soft delete - marks as inactive)
 * DELETE /locations/:id
 * Protected: Admin only
 */
export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    let location;
    if (!isNaN(id)) {
      location = await Location.findOne({ id: parseInt(id) });
    } else {
      location = await Location.findById(id);
    }

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    // Soft delete - mark as inactive
    location.isActive = false;
    await location.save();

    return res.status(200).json({
      success: true,
      message: 'Location deleted successfully (marked as inactive)',
      data: location
    });

  } catch (error) {
    console.error('Delete location error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting location'
    });
  }
};

/**
 * Toggle location active status
 * PATCH /locations/:id/toggle
 * Protected: Admin only
 */
export const toggleLocationStatus = async (req, res) => {
  try {
    const { id } = req.params;

    let location;
    if (!isNaN(id)) {
      location = await Location.findOne({ id: parseInt(id) });
    } else {
      location = await Location.findById(id);
    }

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    location.isActive = !location.isActive;
    await location.save();

    return res.status(200).json({
      success: true,
      message: `Location ${location.isActive ? 'activated' : 'deactivated'} successfully`,
      data: location
    });

  } catch (error) {
    console.error('Toggle location status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error toggling location status'
    });
  }
};
