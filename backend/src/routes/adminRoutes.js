import { Router } from 'express';
import {
  getOverview,
  getProfessionalsList,
  updateProfessional,
  getAppointmentsList,
  updateAppointmentStatus,
  getPaymentsList,
  getUsersList,
  updateUser,
  getQrOrdersList,
  updateQrOrderStatus,
  getSubscriptionsList,
  updatePricingPlan,
  getGrievancesList,
  updateGrievance,
  getSystemSettings,
  updateSystemSettings,
  getSystemAuditLogs,
} from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Guard all admin routes with authentication and Admin role
router.use(authenticate, requireAdmin);

// Overview / Dashboard KPIs
router.get('/overview', getOverview);

// Professional Directory Management
router.get('/professionals', getProfessionalsList);
router.patch('/professionals/:id', updateProfessional);

// Global Appointments Control
router.get('/appointments', getAppointmentsList);
router.patch('/appointments/:id/status', updateAppointmentStatus);

// Global Financial Transactions
router.get('/payments', getPaymentsList);

// User & Role Access Management
router.get('/users', getUsersList);
router.patch('/users/:id', updateUser);

// QR Standee & Physical Kit Orders
router.get('/orders', getQrOrdersList);
router.patch('/orders/:id', updateQrOrderStatus);

// Subscriptions & Pricing Plans
router.get('/subscriptions', getSubscriptionsList);
router.patch('/plans/:id', updatePricingPlan);

// Support & Grievance Tickets
router.get('/grievances', getGrievancesList);
router.patch('/grievances/:id', updateGrievance);

// Platform Settings & Feature Flags
router.get('/settings', getSystemSettings);
router.patch('/settings', updateSystemSettings);

// System Audit Logs
router.get('/audit-logs', getSystemAuditLogs);

export default router;
