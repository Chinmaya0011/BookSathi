/**
 * DPDP Act, 2023 Compliance & Role-Based Data Serializers for Appointments
 *
 * DPDP COMPLIANCE NOTICE (Digital Personal Data Protection Act, 2023):
 * Customer phone, email, and consultation notes constitute Digital Personal Data under India's DPDP Act, 2023.
 * - `reason`: Patient-visible complaint / summary.
 * - `notes`: Private consultation & clinical observations (strictly professional + admin only).
 * - `notesUpdatedAt`, `notesUpdatedBy`: Internal audit timestamps.
 * - Data Retention / Erasure: Hook provided for DPDP data retention & erasure requests.
 */

export const maskPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  const cleaned = phone.trim();
  if (cleaned.length <= 4) return '****';
  const prefix = cleaned.startsWith('+91') ? '+91 ' : '';
  const digits = cleaned.replace(/\D/g, '');
  const last4 = digits.slice(-4);
  return `${prefix}******${last4}`;
};

/**
 * Socket Serializer: Strips private clinical notes, cancelToken, security hashes,
 * and masks phone number so sensitive data cannot leak over socket channels.
 */
export const toSocketAppointment = (doc) => {
  if (!doc) return null;
  const data = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };

  // Never put notes in socket payloads
  delete data.notes;
  delete data.notesUpdatedAt;
  delete data.notesUpdatedBy;

  // Never put cancelToken or security hashes in socket payloads
  delete data.cancelToken;
  delete data.cancelTokenHash;
  delete data.cancelAttempts;
  delete data.lastCancelAttemptAt;

  // Never put full phone in socket payloads
  if (data.customerPhone) {
    data.customerPhone = maskPhone(data.customerPhone);
  }

  return data;
};

/**
 * Public Serializer: Strip all clinical notes and sensitive internal hashes
 * Used for public booking lookups, slot verification, and public profile views.
 */
export const toPublicAppointment = (doc) => {
  if (!doc) return null;
  const data = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };

  // Explicitly remove private clinical notes & security hashes
  delete data.notes;
  delete data.notesUpdatedAt;
  delete data.notesUpdatedBy;
  delete data.cancelTokenHash;
  delete data.cancelAttempts;
  delete data.lastCancelAttemptAt;

  return data;
};

/**
 * Patient / User Serializer: Strip private clinical notes
 * Used for logged-in customer dashboards & user appointment history.
 */
export const toUserAppointment = (doc) => {
  if (!doc) return null;
  const data = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };

  // Patient can see their reason / booking complaint, but NEVER professional private notes
  delete data.notes;
  delete data.notesUpdatedAt;
  delete data.notesUpdatedBy;
  delete data.cancelTokenHash;
  delete data.cancelAttempts;
  delete data.lastCancelAttemptAt;

  return data;
};

/**
 * Professional Serializer: Retain consultation notes, notesUpdatedAt, notesUpdatedBy
 * Used for professional dashboard, queue management, and appointment detail view.
 */
export const toProfessionalAppointment = (doc) => {
  if (!doc) return null;
  const data = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };

  // Remove internal auth hashes, retain private notes
  delete data.cancelTokenHash;
  delete data.cancelAttempts;
  delete data.lastCancelAttemptAt;

  return data;
};

/**
 * Admin Serializer: Retain notes and attach audit metadata flag
 * Every admin access is logged to SystemAuditLog.
 */
export const toAdminAppointment = (doc, { auditLogged = true } = {}) => {
  if (!doc) return null;
  const data = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };

  delete data.cancelTokenHash;
  delete data.cancelAttempts;
  delete data.lastCancelAttemptAt;

  data._auditLogged = auditLogged;
  data.hasAdminAudit = true;

  return data;
};
