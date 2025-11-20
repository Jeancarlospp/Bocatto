import express from 'express';
import { getAllMenu } from '../controllers/menuController.js';

const router = express.Router();

router.get('/', getAllMenu);

export default router;
