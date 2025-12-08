import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';

const USER_MEDIA_ROOT = join(process.cwd(), 'public', 'images', 'user');

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
        destination: (req, file, cb) => {
            let subfolder = '';

            if (file.fieldname === 'avatar') {
                subfolder = 'avatars';
            } else if (file.fieldname === 'cover') {
                subfolder = 'covers';
            } else {
                subfolder = 'others'; 
            }

            const finalDestination = join(USER_MEDIA_ROOT, subfolder);

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