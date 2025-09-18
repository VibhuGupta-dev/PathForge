import express from 'express';
const router = express.Router();
import {createCareerAssessment  } from '../controller/CarrierAssesment.js';

router.post('/submit', createCareerAssessment);

export default router;
