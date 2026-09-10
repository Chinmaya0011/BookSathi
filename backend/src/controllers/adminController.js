import {
  getSystemOverviewStats,
  getAllProfessionals,
  updateProfessionalAdmin,
  getAllAppointmentsAdmin,
  updateAppointmentStatusAdmin,
  getAllPaymentsAdmin,
  getAllUsersAdmin,
  updateUserAdmin,
  getAllQrOrdersAdmin,
  updateQrOrderStatusAdmin,
  getAllSubscriptionsAdmin,
  updatePricingPlanAdmin,
  getAllGrievancesAdmin,
  updateGrievanceAdmin,
  getSystemSettingsAdmin,
  updateSystemSettingsAdmin,
  getAuditLogs,
} from '../services/adminService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getOverview = async (req, res, next) => {
  try {
    const stats = await getSystemOverviewStats();
    return successResponse(res, 200, 'System overview stats retrieved', stats);
  } catch (err) {
    next(err);
  }
};

export const getProfessionalsList = async (req, res, next) => {
  try {
    const result = await getAllProfessionals(req.query);
    return successResponse(res, 200, 'Professionals list retrieved', result);
  } catch (err) {
    next(err);
  }
};

export const updateProfessional = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await updateProfessionalAdmin(id, req.user, req.body);
    return successResponse(res, 200, 'Professional profile updated by admin', result);
  } catch (err) {
    next(err);
  }
};

export const getAppointmentsList = async (req, res, next) => {
  try {
    const result = await getAllAppointmentsAdmin(req.query);
    return successResponse(res, 200, 'Global appointments retrieved', result);
  } catch (err) {
    next(err);
  }
};

export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, cancelReason } = req.body;
    const result = await updateAppointmentStatusAdmin(id, req.user, { status, cancelReason });
    return successResponse(res, 200, `Appointment status updated to ${status}`, result);
  } catch (err) {
    next(err);
  }
};

export const getPaymentsList = async (req, res, next) => {
  try {
    const result = await getAllPaymentsAdmin(req.query);
    return successResponse(res, 200, 'System-wide payments retrieved', result);
  } catch (err) {
    next(err);
  }
};

export const getUsersList = async (req, res, next) => {
  try {
    const result = await getAllUsersAdmin(req.query);
    return successResponse(res, 200, 'Users retrieved', result);
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await updateUserAdmin(id, req.user, req.body);
    return successResponse(res, 200, 'User account updated successfully', result);
  } catch (err) {
    next(err);
  }
};

export const getQrOrdersList = async (req, res, next) => {
  try {
    const result = await getAllQrOrdersAdmin(req.query);
    return successResponse(res, 200, 'QR Kit orders retrieved', result);
  } catch (err) {
    next(err);
  }
};

export const updateQrOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await updateQrOrderStatusAdmin(id, req.user, req.body);
    return successResponse(res, 200, 'QR Kit order updated successfully', result);
  } catch (err) {
    next(err);
  }
};

export const getSubscriptionsList = async (req, res, next) => {
  try {
    const result = await getAllSubscriptionsAdmin(req.query);
    return successResponse(res, 200, 'Subscriptions & plans retrieved', result);
  } catch (err) {
    next(err);
  }
};

export const updatePricingPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await updatePricingPlanAdmin(id, req.user, req.body);
    return successResponse(res, 200, 'Pricing plan updated successfully', result);
  } catch (err) {
    next(err);
  }
};

export const getGrievancesList = async (req, res, next) => {
  try {
    const result = await getAllGrievancesAdmin(req.query);
    return successResponse(res, 200, 'Grievance tickets retrieved', result);
  } catch (err) {
    next(err);
  }
};

export const updateGrievance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await updateGrievanceAdmin(id, req.user, req.body);
    return successResponse(res, 200, 'Grievance ticket updated successfully', result);
  } catch (err) {
    next(err);
  }
};

export const getSystemSettings = async (req, res, next) => {
  try {
    const settings = await getSystemSettingsAdmin();
    return successResponse(res, 200, 'System settings retrieved', settings);
  } catch (err) {
    next(err);
  }
};

export const updateSystemSettings = async (req, res, next) => {
  try {
    const settings = await updateSystemSettingsAdmin(req.user, req.body);
    return successResponse(res, 200, 'System settings updated successfully', settings);
  } catch (err) {
    next(err);
  }
};

export const getSystemAuditLogs = async (req, res, next) => {
  try {
    const result = await getAuditLogs(req.query);
    return successResponse(res, 200, 'Audit logs retrieved', result);
  } catch (err) {
    next(err);
  }
};
