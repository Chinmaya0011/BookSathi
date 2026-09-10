import { Availability } from '../models/Availability.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getWeeklyAvailability = async (req, res, next) => {
  try {
    if (!req.profile) {
      return successResponse(res, 200, 'Weekly availability retrieved', []);
    }
    const availability = await Availability.find({ professionalId: req.profile._id }).sort({
      dayOfWeek: 1,
    });
    return successResponse(res, 200, 'Weekly availability retrieved', availability);
  } catch (err) {
    next(err);
  }
};

export const updateWeeklyAvailability = async (req, res, next) => {
  try {
    const { availability } = req.body;

    if (!Array.isArray(availability)) {
      return errorResponse(res, 400, 'Availability must be an array');
    }

    const operations = availability.map((dayData) => ({
      updateOne: {
        filter: { professionalId: req.profile._id, dayOfWeek: dayData.dayOfWeek },
        update: {
          $set: {
            enabled: Boolean(dayData.enabled),
            timeRanges: dayData.enabled
              ? (dayData.timeRanges || []).map((r) => ({
                  startTime: r.startTime,
                  endTime: r.endTime,
                }))
              : [],
          },
        },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await Availability.bulkWrite(operations);
    }

    const updated = await Availability.find({ professionalId: req.profile._id }).sort({
      dayOfWeek: 1,
    });

    return successResponse(res, 200, 'Weekly availability saved successfully', updated);
  } catch (err) {
    next(err);
  }
};

export const copyMondaySchedule = async (req, res, next) => {
  try {
    const monday = await Availability.findOne({
      professionalId: req.profile._id,
      dayOfWeek: 1, // 1 = Monday
    });

    if (!monday) {
      return errorResponse(res, 404, 'Monday schedule not configured.');
    }

    // Days 2 to 5 (Tue, Wed, Thu, Fri)
    const targetDays = [2, 3, 4, 5];
    const operations = targetDays.map((day) => ({
      updateOne: {
        filter: { professionalId: req.profile._id, dayOfWeek: day },
        update: {
          $set: {
            enabled: monday.enabled,
            timeRanges: monday.timeRanges,
          },
        },
        upsert: true,
      },
    }));

    await Availability.bulkWrite(operations);

    const updated = await Availability.find({ professionalId: req.profile._id }).sort({
      dayOfWeek: 1,
    });

    return successResponse(res, 200, 'Monday schedule copied to all weekdays (Tue-Fri)', updated);
  } catch (err) {
    next(err);
  }
};
