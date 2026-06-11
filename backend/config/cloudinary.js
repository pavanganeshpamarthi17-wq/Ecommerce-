const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

let productStorage;
let avatarStorage;

const hasCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  !process.env.CLOUDINARY_CLOUD_NAME.includes('your_cloud_name') &&
  process.env.CLOUDINARY_API_KEY &&
  !process.env.CLOUDINARY_API_KEY.includes('your_api_key');

if (!hasCloudinary) {
  // Local storage setup
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const localDiskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });

  // Create a wrapper for path mapping to return a URL instead of a file system path
  const localDiskStorageWithUrl = {
    _handleFile: (req, file, cb) => {
      localDiskStorage._handleFile(req, file, (err, info) => {
        if (err) return cb(err);
        // Map path to localhost URL
        info.path = `http://localhost:5000/uploads/${info.filename}`;
        info.filename = info.filename;
        cb(null, info);
      });
    },
    _removeFile: (req, file, cb) => {
      localDiskStorage._removeFile(req, file, cb);
    }
  };

  productStorage = localDiskStorageWithUrl;
  avatarStorage = localDiskStorageWithUrl;

  // Mock cloudinary object as well to prevent errors on delete
  cloudinary.uploader = {
    destroy: async (publicId) => {
      try {
        const filePath = path.join(uploadDir, publicId);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        // ignore
      }
      return { result: 'ok' };
    }
  };
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Product images storage
  productStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'ecommerce/products',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
    },
  });

  // Avatar storage
  avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'ecommerce/avatars',
      allowed_formats: ['jpg', 'jpeg', 'png'],
      transformation: [{ width: 200, height: 200, crop: 'fill', quality: 'auto' }],
    },
  });
}

const uploadProduct = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

module.exports = { cloudinary, uploadProduct, uploadAvatar };
