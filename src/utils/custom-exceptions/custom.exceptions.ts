import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomValuesConflict extends HttpException {
  constructor(message: string) {
    super({ message, status: HttpStatus.BAD_REQUEST }, HttpStatus.BAD_REQUEST);
  }
}


export class RecordNotFoundException extends HttpException {
  constructor() {
    super('Record not found', HttpStatus.NOT_FOUND);
  }
}

