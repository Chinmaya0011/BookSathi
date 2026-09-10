import { AppointmentType } from '../models/AppointmentType.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getAppointmentTypes = async (req, res, next) => {
  try {
    if (!req.profile) {
      return successResponse(res, 200, 'Appointment types retrieved', []);
    }
    const types = await AppointmentType.find({ professionalId: req.profile._id }).sort({
      createdAt: 1,
    });
    return successResponse(res, 200, 'Appointment types retrieved', types);
  } catch (err) {
    next(err);
  }
};

export const createAppointmentType = async (req, res, next) => {
  try {
    if (!req.profile) {
      return errorResponse(res, 400, 'Professional profile not found. Please complete profile setup.');
    }
    const newType = await AppointmentType.create({
      professionalId: req.profile._id,
      ...req.body,
    });
    return successResponse(res, 201, 'Appointment type created', newType);
  } catch (err) {
    next(err);
  }
};

export const updateAppointmentType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await AppointmentType.findOneAndUpdate(
      { _id: id, professionalId: req.profile._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return errorResponse(res, 404, 'Appointment type not found');
    }
    return successResponse(res, 200, 'Appointment type updated', updated);
  } catch (err) {
    next(err);
  }
};

export const deleteAppointmentType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await AppointmentType.findOneAndDelete({
      _id: id,
      professionalId: req.profile._id,
    });
    if (!deleted) {
      return errorResponse(res, 404, 'Appointment type not found');
    }
    return successResponse(res, 200, 'Appointment type deleted');
  } catch (err) {
    next(err);
  }
};
