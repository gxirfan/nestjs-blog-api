import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';

// 🎯 SABİT KÖK DİZİN: public/images/user
const USER_MEDIA_ROOT = join(process.cwd(), 'public', 'images', 'user');

// Dosya adını düzenler (editFileName fonksiyonu aynı kalır)
const editFileName = (req, file, callback) => {
  const fileExtName = extname(file.originalname);
  const userIdentifier = req.user?.username || req.user?.id || 'anonymous'; 
  const filename = `${file.fieldname}_${userIdentifier}_${Date.now()}${fileExtName}`;
  callback(null, filename);
};

const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new Error('Only image files are allowed!'), false);
  }
  callback(null, true);
};

export const mediaUploadOptions = {
    storage: diskStorage({
        // 🎯 GÜNCELLENEN destination FONKSİYONU
        destination: (req, file, cb) => {
            let subfolder = '';

            // Dosya alanının adına göre alt klasörü belirle
            if (file.fieldname === 'avatar') {
                subfolder = 'avatars';
            } else if (file.fieldname === 'cover') {
                subfolder = 'covers';
            } else {
                // Diğer alanlar için varsayılan bir klasör kullanabiliriz
                subfolder = 'others'; 
            }

            // Tam hedef yolu oluştur: .../public/images/user/[avatars|covers|others]
            const finalDestination = join(USER_MEDIA_ROOT, subfolder);

            // Klasör yoksa oluştur
            if (!existsSync(finalDestination)) {
              mkdirSync(finalDestination, { recursive: true });
            }
            
            cb(null, finalDestination);
        },
        filename: editFileName,
    }),
    fileFilter: imageFileFilter,
    limits: { 
        fileSize: 5 * 1024 * 1024
    }, 
};