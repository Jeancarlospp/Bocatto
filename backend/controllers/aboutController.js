import AboutUs from '../models/AboutUs.js';
import { v2 as cloudinary } from 'cloudinary';

/**
 * ========================================
 * ABOUT US CONTROLLERS
 * ========================================
 */

/**
 * Get active About Us configuration (Public)
 * GET /api/about
 */
export const getAboutUs = async (req, res) => {
  try {
    const config = await AboutUs.getActiveConfig();
    
    return res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error getting about us config:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener la configuración.'
    });
  }
};

/**
 * Update entire About Us configuration (Admin)
 * PUT /api/about
 */
export const updateAboutUs = async (req, res) => {
  try {
    const updateData = req.body;
    
    let config = await AboutUs.findOne({ isActive: true });
    
    if (!config) {
      config = new AboutUs(updateData);
    } else {
      Object.assign(config, updateData);
    }
    
    config.lastUpdatedBy = req.user?.email || 'admin';
    await config.save();
    
    return res.status(200).json({
      success: true,
      message: 'Configuración actualizada exitosamente.',
      data: config
    });
  } catch (error) {
    console.error('Error updating about us:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar la configuración.'
    });
  }
};

/**
 * Update Hero Section
 * PUT /api/about/hero
 */
export const updateHero = async (req, res) => {
  try {
    const { title, subtitle, stats } = req.body;
    
    const config = await AboutUs.getActiveConfig();
    
    if (title) config.hero.title = title;
    if (subtitle) config.hero.subtitle = subtitle;
    if (stats) config.hero.stats = stats;
    
    config.lastUpdatedBy = req.user?.email || 'admin';
    await config.save();
    
    return res.status(200).json({
      success: true,
      message: 'Sección Hero actualizada.',
      data: config.hero
    });
  } catch (error) {
    console.error('Error updating hero:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar la sección Hero.'
    });
  }
};

/**
 * Update Mission Section
 * PUT /api/about/mission
 */
export const updateMission = async (req, res) => {
  try {
    const { title, description, highlights } = req.body;
    
    const config = await AboutUs.getActiveConfig();
    
    if (title) config.mission.title = title;
    if (description) config.mission.description = description;
    if (highlights) config.mission.highlights = highlights;
    
    config.lastUpdatedBy = req.user?.email || 'admin';
    await config.save();
    
    return res.status(200).json({
      success: true,
      message: 'Sección Misión actualizada.',
      data: config.mission
    });
  } catch (error) {
    console.error('Error updating mission:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar la sección Misión.'
    });
  }
};

/**
 * Upload Mission Image
 * POST /api/about/mission/image
 */
export const uploadMissionImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen.'
      });
    }

    const config = await AboutUs.getActiveConfig();
    
    // Delete old image from Cloudinary if exists
    if (config.mission.image) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = config.mission.image.split('/');
        const fileWithExtension = urlParts[urlParts.length - 1];
        const publicId = `bocatto/about/${fileWithExtension.split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        console.log('Could not delete old image:', e.message);
      }
    }
    
    // req.file.path contains the full Cloudinary URL
    config.mission.image = req.file.path;
    config.lastUpdatedBy = req.user?.email || 'admin';
    await config.save();
    
    return res.status(200).json({
      success: true,
      message: 'Imagen de misión actualizada.',
      data: { image: config.mission.image }
    });
  } catch (error) {
    console.error('Error uploading mission image:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al subir la imagen.'
    });
  }
};

/**
 * Update Timeline
 * PUT /api/about/timeline
 */
export const updateTimeline = async (req, res) => {
  try {
    const { timeline } = req.body;
    
    if (!timeline || !Array.isArray(timeline)) {
      return res.status(400).json({
        success: false,
        message: 'Timeline debe ser un array.'
      });
    }
    
    const config = await AboutUs.getActiveConfig();
    config.timeline = timeline;
    config.lastUpdatedBy = req.user?.email || 'admin';
    await config.save();
    
    return res.status(200).json({
      success: true,
      message: 'Timeline actualizado.',
      data: config.timeline
    });
  } catch (error) {
    console.error('Error updating timeline:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar el timeline.'
    });
  }
};

/**
 * Upload Timeline Image
 * POST /api/about/timeline/:index/image
 */
export const uploadTimelineImage = async (req, res) => {
  try {
    const { index } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen.'
      });
    }

    const config = await AboutUs.getActiveConfig();
    
    if (!config.timeline[index]) {
      return res.status(404).json({
        success: false,
        message: 'Elemento de timeline no encontrado.'
      });
    }
    
    // Delete old image if exists
    if (config.timeline[index].image) {
      const publicId = config.timeline[index].image.split('/').slice(-2).join('/').split('.')[0];
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        console.log('Could not delete old image:', e.message);
      }
    }
    
    config.timeline[index].image = req.file.path;
    config.lastUpdatedBy = req.user?.email || 'admin';
    await config.save();
    
    return res.status(200).json({
      success: true,
      message: 'Imagen de timeline actualizada.',
      data: { image: config.timeline[index].image }
    });
  } catch (error) {
    console.error('Error uploading timeline image:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al subir la imagen.'
    });
  }
};

/**
 * Update Values
 * PUT /api/about/values
 */
export const updateValues = async (req, res) => {
  try {
    const { values } = req.body;
    
    if (!values || !Array.isArray(values)) {
      return res.status(400).json({
        success: false,
        message: 'Values debe ser un array.'
      });
    }
    
    const config = await AboutUs.getActiveConfig();
    config.values = values;
    config.lastUpdatedBy = req.user?.email || 'admin';
    await config.save();
    
    return res.status(200).json({
      success: true,
      message: 'Valores actualizados.',
      data: config.values
    });
  } catch (error) {
    console.error('Error updating values:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar los valores.'
    });
  }
};

/**
 * Update Team
 * PUT /api/about/team
 */
export const updateTeam = async (req, res) => {
  try {
    const { team } = req.body;
    
    if (!team || !Array.isArray(team)) {
      return res.status(400).json({
        success: false,
        message: 'Team debe ser un array.'
      });
    }
    
    const config = await AboutUs.getActiveConfig();
    config.team = team;
    config.lastUpdatedBy = req.user?.email || 'admin';
    await config.save();
    
    return res.status(200).json({
      success: true,
      message: 'Equipo actualizado.',
      data: config.team
    });
  } catch (error) {
    console.error('Error updating team:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar el equipo.'
    });
  }
};

/**
 * Upload Team Member Image
 * POST /api/about/team/:index/image
 */
export const uploadTeamImage = async (req, res) => {
  try {
    const { index } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen.'
      });
    }

    const config = await AboutUs.getActiveConfig();
    
    if (!config.team[index]) {
      return res.status(404).json({
        success: false,
        message: 'Miembro del equipo no encontrado.'
      });
    }
    
    // Delete old image if exists
    if (config.team[index].image) {
      const publicId = config.team[index].image.split('/').slice(-2).join('/').split('.')[0];
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        console.log('Could not delete old image:', e.message);
      }
    }
    
    config.team[index].image = req.file.path;
    config.lastUpdatedBy = req.user?.email || 'admin';
    await config.save();
    
    return res.status(200).json({
      success: true,
      message: 'Imagen del miembro actualizada.',
      data: { image: config.team[index].image }
    });
  } catch (error) {
    console.error('Error uploading team image:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al subir la imagen.'
    });
  }
};

/**
 * Update Gallery
 * PUT /api/about/gallery
 */
export const updateGallery = async (req, res) => {
  try {
    const { gallery } = req.body;
    
    if (!gallery || !Array.isArray(gallery)) {
      return res.status(400).json({
        success: false,
        message: 'Gallery debe ser un array.'
      });
    }
    
    const config = await AboutUs.getActiveConfig();
    config.gallery = gallery;
    config.lastUpdatedBy = req.user?.email || 'admin';
    await config.save();
    
    return res.status(200).json({
      success: true,
      message: 'Galería actualizada.',
      data: config.gallery
    });
  } catch (error) {
    console.error('Error updating gallery:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar la galería.'
    });
  }
};

/**
 * Add Gallery Image
 * POST /api/about/gallery/image
 */
export const addGalleryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen.'
      });
    }

    const { caption } = req.body;
    const config = await AboutUs.getActiveConfig();
    
    config.gallery.push({
      image: req.file.path,
      caption: caption || ''
    });
    
    config.lastUpdatedBy = req.user?.email || 'admin';
    await config.save();
    
    return res.status(200).json({
      success: true,
      message: 'Imagen añadida a la galería.',
      data: config.gallery
    });
  } catch (error) {
    console.error('Error adding gallery image:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al añadir imagen a la galería.'
    });
  }
};

/**
 * Delete Gallery Image
 * DELETE /api/about/gallery/:index
 */
export const deleteGalleryImage = async (req, res) => {
  try {
    const { index } = req.params;
    
    const config = await AboutUs.getActiveConfig();
    
    if (!config.gallery[index]) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada.'
      });
    }
    
    // Delete from Cloudinary
    if (config.gallery[index].image) {
      const publicId = config.gallery[index].image.split('/').slice(-2).join('/').split('.')[0];
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        console.log('Could not delete image:', e.message);
      }
    }
    
    config.gallery.splice(index, 1);
    config.lastUpdatedBy = req.user?.email || 'admin';
    await config.save();
    
    return res.status(200).json({
      success: true,
      message: 'Imagen eliminada de la galería.',
      data: config.gallery
    });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar imagen.'
    });
  }
};

/**
 * Update CTA Section
 * PUT /api/about/cta
 */
export const updateCTA = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    const config = await AboutUs.getActiveConfig();
    
    if (title) config.cta.title = title;
    if (description) config.cta.description = description;
    
    config.lastUpdatedBy = req.user?.email || 'admin';
    await config.save();
    
    return res.status(200).json({
      success: true,
      message: 'Sección CTA actualizada.',
      data: config.cta
    });
  } catch (error) {
    console.error('Error updating CTA:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar la sección CTA.'
    });
  }
};
