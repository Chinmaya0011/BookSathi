import { BlockedDate } from '../models/BlockedDate.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getBlockedDates = async (req, res, next) => {
  try {
    if (!req.profile) {
      return successResponse(res, 200, 'Blocked dates retrieved', []);
    }
    const blockedDates = await BlockedDate.find({
      professionalId: req.profile._id,
    }).sort({ date: 1 });

    return successResponse(res, 200, 'Blocked dates retrieved', blockedDates);
  } catch (err) {
    next(err);
  }
};

export const createBlockedDate = async (req, res, next) => {
  try {
    if (!req.profile) {
      return errorResponse(res, 400, 'Professional profile not found. Please complete profile setup.');
    }
    const { date, allDay, startTime, endTime, reason } = req.body;

    const existing = await BlockedDate.findOne({
      professionalId: req.profile._id,
      date,
      allDay: true,
    });

    if (existing && allDay) {
      return errorResponse(res, 400, 'This date is already completely blocked.');
    }

    const blocked = await BlockedDate.create({
      professionalId: req.profile._id,
      date,
      allDay: allDay !== undefined ? allDay : true,
      startTime: allDay ? undefined : startTime,
      endTime: allDay ? undefined : endTime,
      reason,
    });

    return successResponse(res, 201, 'Blocked date added successfully', blocked);
  } catch (err) {
    next(err);
  }
};

export const deleteBlockedDate = async (req, res, next) => {
  try {
    if (!req.profile) {
      return errorResponse(res, 400, 'Professional profile not found.');
    }
    const { id } = req.params;
    const deleted = await BlockedDate.findOneAndDelete({
      _id: id,
      professionalId: req.profile._id,
    });

    if (!deleted) {
      return errorResponse(res, 404, 'Blocked date not found');
    }

    return successResponse(res, 200, 'Blocked date removed successfully');
  } catch (err) {
    next(err);
  }
};
