import VerificationRequest from '../models/VerificationRequest.js';
import User from '../models/User.js';

// POST /api/verifications  (verify_req.php — upload ID document)
export async function requestVerification(req, res, next) {
  try {
    const pending = await VerificationRequest.findOne({ user: req.user._id, status: 0 });
    if (pending) return res.status(409).json({ message: 'You already have a pending verification request!' });

    if (!req.file) return res.status(400).json({ message: 'Please upload a document.' });

    await VerificationRequest.create({
      user: req.user._id,
      idDocumentPath: `uploads/id_docs/${req.file.filename}`,
      status: 0
    });
    res.status(201).json({ message: 'Your verification request has been submitted!' });
  } catch (err) { next(err); }
}

// GET /api/verifications/pending  (all_verify.php — admin)
export async function listPending(req, res, next) {
  try {
    const requests = await VerificationRequest.find({ status: 0 })
      .sort({ createdAt: 1 })
      .populate('user', 'firstname lastname email');
    res.json({
      requests: requests
        .filter((r) => r.user)
        .map((r) => ({
          id: r._id,
          user: { id: r.user._id, firstname: r.user.firstname, lastname: r.user.lastname, email: r.user.email },
          idDocumentPath: r.idDocumentPath
        }))
    });
  } catch (err) { next(err); }
}

// PUT /api/verifications/:id/approve  (approve_verification.php — admin)
export async function approve(req, res, next) {
  try {
    const request = await VerificationRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });
    request.status = 1;
    await request.save();
    await User.findByIdAndUpdate(request.user, { verify: 1 });
    res.json({ message: 'User verification approved successfully.' });
  } catch (err) { next(err); }
}

// PUT /api/verifications/:id/reject  (reject_verification.php — admin)
export async function reject(req, res, next) {
  try {
    const request = await VerificationRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });
    request.status = 2;
    await request.save();
    res.json({ message: 'User verification rejected.' });
  } catch (err) { next(err); }
}
