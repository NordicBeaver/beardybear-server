import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import * as path from 'path';
import * as crypto from 'crypto';

const multerStorage = multer.diskStorage({
  destination: 'uploads/images',
  filename: (req, file, callback) => {
    const id = crypto.randomUUID();
    const extension = path.extname(file.originalname);
    callback(null, id + extension);
  },
});

@Controller('images')
export class ImagesController {
  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: multerStorage }))
  upload(@UploadedFile() file?: Express.Multer.File) {
    if (file == undefined) {
      throw new HttpException(
        'Missing file in request.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return file.filename;
  }
}
