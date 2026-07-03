import Report from '../models/Report.js';
import Property from '../models/Property.js';

// POST /api/reports  (property_details.php report form — one per user per property)
export async function createReport(req, res, next) {
  try {
    const { propertyId, reason } = req.body;
    if (!propertyId || !reason) return res.status(400).json({ message: 'Reason is required.' });

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found!' });
    if (String(property.owner) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot report your own property.' });
    }

    const existing = await Report.findOne({ property: propertyId, user: req.user._id });
    if (existing) return res.status(409).json({ message: 'You have already reported this property.' });

    await Report.create({ property: propertyId, user: req.user._id, reason, dateReported: new Date() });
    res.status(201).json({ message: 'Report submitted successfully.' });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'You have already reported this property.' });
    next(err);
  }
}

// GET /api/reports  (reports.php — admin)
export async function listReports(req, res, next) {
  try {
    const reports = await Report.find()
      .sort({ createdAt: 1 })
      .populate('user', 'firstname lastname')
      .populate({ path: 'property', select: 'title owner', populate: { path: 'owner', select: 'firstname lastname' } });

    res.json({
      reports: reports
        .filter((r) => r.property) // property may have been deleted
        .map((r) => ({
          id: r._id,
          reason: r.reason,
          dateReported: r.dateReported,
          reportingUser: r.user ? { id: r.user._id, firstname: r.user.firstname, lastname: r.user.lastname } : null,
          reportedUser: r.property.owner
            ? { id: r.property.owner._id, firstname: r.property.owner.firstname, lastname: r.property.owner.lastname }
            : null,
          property: { id: r.property._id, title: r.property.title }
        }))
    });
  } catch (err) { next(err); }
}

// DELETE /api/reports/:id  (ignore_report.php — admin)
export async function ignoreReport(req, res, next) {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found.' });
    res.json({ message: 'Report deleted successfully.' });
  } catch (err) { next(err); }
}
