import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import * as csvParser from 'csv-parser';

interface CsvUserData {
  email: string;
  fullName: string;
  avatarUrl?: string;
  phoneNumber?: string;
}

@Injectable()
export class UserService {
  constructor() {}

  parseCsv(csv: string): Promise<CsvUserData[]> {
    const result: CsvUserData[] = [];
    return new Promise((resolve, reject) => {
      Readable.from(csv)
        .pipe(csvParser())
        .on('data', (data: CsvUserData) => result.push(data))
        .on('end', () => resolve(result))
        .on('error', reject);
    });
  }
}
