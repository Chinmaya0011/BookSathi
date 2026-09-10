import { Router } from 'express';
import {
  getAppointmentTypes,
  createAppointmentType,
  updateAppointmentType,
  deleteAppointmentType,
} from '../controllers/appointmentTypeController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { createAppointmentTypeSchema } from '../validators/appointmentValidators.js';

const router = Router();

router.use(authenticate);

router.get('/', getAppointmentTypes);
router.post('/', validate(createAppointmentTypeSchema), createAppointmentType);
router.put('/:id', updateAppointmentType);
router.delete('/:id', deleteAppointmentType);

export default router;
