import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_ROOT = path.resolve(__dirname, '../../uploads');
export const ID_DOCS_DIR = path.join(UPLOAD_ROOT, 'id_docs');
export const PROFILE_DIR = path.join(UPLOAD_ROOT, 'profiles');

for (const dir of [UPLOAD_ROOT, ID_DOCS_DIR, PROFILE_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

const IMAGE_TYPES = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];

function makeStorage(dir) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    // Same naming convention as the PHP app: time()_originalname
    filename: (req, file, cb) =>
      cb(null, `${Date.now()}_${path.basename(file.originalname).replace(/\s+/g, '-')}`)
  });
}

function imageFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (IMAGE_TYPES.includes(ext)) return cb(null, true);
  cb(new Error('Invalid file type. Only JPG, JPEG, PNG, GIF, WEBP and AVIF files are allowed.'));
}

const LIMITS = { fileSize: 10 * 1024 * 1024 };

// Property photos: fields photo1..photo6, exactly like the PHP forms.
export const propertyPhotosUpload = multer({ storage: makeStorage(UPLOAD_ROOT), fileFilter: imageFilter, limits: LIMITS })
  .fields([1, 2, 3, 4, 5, 6].map((i) => ({ name: `photo${i}`, maxCount: 1 })));

// Profile picture: field profile_picture (user.php)
export const profileUpload = multer({ storage: makeStorage(PROFILE_DIR), fileFilter: imageFilter, limits: LIMITS })
  .single('profile_picture');

// ID document: field id_document (verify_req.php)
export const idDocUpload = multer({ storage: makeStorage(ID_DOCS_DIR), limits: LIMITS })
  .single('id_document');
