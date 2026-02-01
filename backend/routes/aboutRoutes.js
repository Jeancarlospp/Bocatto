import express from 'express';
import {
  getAboutUs,
  updateAboutUs,
  updateHero,
  updateMission,
  uploadMissionImage,
  updateTimeline,
  uploadTimelineImage,
  updateValues,
  updateTeam,
  uploadTeamImage,
  updateGallery,
  addGalleryImage,
  deleteGalleryImage,
  updateCTA
} from '../controllers/aboutController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from '../middleware/upload.js';

const router = express.Router();

/**
 * ========================================
 * ABOUT US ROUTES
 * Base path: /api/about
 * ========================================
 */

// Configure upload for about images
const aboutStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bocatto/about',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  }
});

const aboutUpload = multer({
  storage: aboutStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * PUBLIC ROUTES
 */

// Get About Us content (public)
router.get('/', getAboutUs);

/**
 * ADMIN ROUTES
 * All require authentication and admin role
 */

// Update entire configuration
router.put('/', authenticateToken, isAdmin, updateAboutUs);

// Hero Section
router.put('/hero', authenticateToken, isAdmin, updateHero);

// Mission Section
router.put('/mission', authenticateToken, isAdmin, updateMission);
router.post('/mission/image', authenticateToken, isAdmin, aboutUpload.single('image'), uploadMissionImage);

// Timeline Section
router.put('/timeline', authenticateToken, isAdmin, updateTimeline);
router.post('/timeline/:index/image', authenticateToken, isAdmin, aboutUpload.single('image'), uploadTimelineImage);

// Values Section
router.put('/values', authenticateToken, isAdmin, updateValues);

// Team Section
router.put('/team', authenticateToken, isAdmin, updateTeam);
router.post('/team/:index/image', authenticateToken, isAdmin, aboutUpload.single('image'), uploadTeamImage);

// Gallery Section
router.put('/gallery', authenticateToken, isAdmin, updateGallery);
router.post('/gallery/image', authenticateToken, isAdmin, aboutUpload.single('image'), addGalleryImage);
router.delete('/gallery/:index', authenticateToken, isAdmin, deleteGalleryImage);

// CTA Section
router.put('/cta', authenticateToken, isAdmin, updateCTA);

export default router;
