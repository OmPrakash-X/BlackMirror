import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public"); 
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname); 
    const baseName = path.basename(file.originalname, ext);

    const safeName = baseName
      .replace(/\s+/g, "_")           
      .replace(/[^a-zA-Z0-9_-]/g, ""); 

    cb(null, `${safeName}_${timestamp}${ext}`);
  },
});

export const upload = multer({ storage });