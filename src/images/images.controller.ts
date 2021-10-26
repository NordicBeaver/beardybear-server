import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import * as crypto from 'crypto';
import { Response } from 'express';
import { createReadStream } from 'fs';
import * as multer from 'multer';
import * as path from 'path';
import { join } from 'path';

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
  @UseGuards(AuthGuard('jwt'))
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

  @Get(':filename')
  getImage(@Param('filename') filename: string, @Res() response: Response) {
    const filepath = join(process.cwd(), 'uploads', 'images', filename);
    const file = createReadStream(filepath);
    file.pipe(response);
  }
}
