import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Security HTTP Headers
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:;");

    next();
  }
}

/**
 * Utility to mask sensitive personal data (CPF, Phone, Bank Account) for LGPD compliance
 */
export function maskSensitiveData(input: string, type: 'CPF' | 'EMAIL' | 'PHONE'): string {
  if (!input) return input;
  if (type === 'CPF') {
    // 123.456.789-00 -> ***.***.789-**
    return input.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, '***.***.$3-**');
  }
  if (type === 'EMAIL') {
    // user@example.com -> u***r@example.com
    const [user, domain] = input.split('@');
    if (!domain) return input;
    const maskedUser = user.length > 2 ? `${user[0]}***${user[user.length - 1]}` : '***';
    return `${maskedUser}@${domain}`;
  }
  if (type === 'PHONE') {
    // (11) 98888-7777 -> (11) 9****-7777
    return input.replace(/(\(\d{2}\)\s?\d)(\d{4})(-\d{4})/, '$1****$3');
  }
  return input;
}
