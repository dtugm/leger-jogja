import { Injectable } from '@nestjs/common';
import { hash, compare } from 'bcryptjs';

@Injectable()
export class PasswordService {
  private static readonly SALT_ROUNDS = 12;

  async hash(value: string): Promise<string> {
    return hash(value, PasswordService.SALT_ROUNDS);
  }

  async compare(plainText: string, hashedValue: string): Promise<boolean> {
    return compare(plainText, hashedValue);
  }
}
