// libs/common/interceptors/file.interceptor.ts
import { FileInterceptor } from "@nestjs/platform-express";

export const CsvFileInterceptor = () =>
  FileInterceptor("file", {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(csv)$/)) {
        return cb(new Error("Only CSV files are allowed!"), false);
      }
      cb(null, true);
    },
  });
