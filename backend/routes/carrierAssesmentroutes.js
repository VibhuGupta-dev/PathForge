import express from 'express';
const router = express.Router();
import {createCareerAssessment , checkAssessmentStatus  } from '../controller/CarrierAssesment.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

router.post('/submit', createCareerAssessment);

router.get("/status", authMiddleware, checkAssessmentStatus)

export default router;