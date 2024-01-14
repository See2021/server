import { Module } from '@nestjs/common';
import { FarmService } from './farm.service';
import { FarmController } from './farm.controller';
import { PrismaService } from 'src/prisma.service';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';

@Module({
  imports: [
    MulterModule.register({
      dest: './public',
      limits: {
        fileSize: 5 * 1024 * 1024, // Adjust the file size limit (5MB in this example)
      },
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = file.fieldname === 'tree_photo_path' ? './public/tree' : './public';
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const newFilename = `${Date.now()}-${file.originalname}`;
          cb(null, newFilename);
        },
      }),
    }),
  ],
  controllers: [FarmController],
  providers: [FarmService, PrismaService],
})
export class FarmModule { }
