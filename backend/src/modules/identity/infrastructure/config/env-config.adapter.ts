import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ConfigPort } from '../../domain/ports/config.port';

@Injectable()
export class EnvConfigAdapter implements ConfigPort {
  constructor(private readonly configService: ConfigService) {}

  getJwtAccessTTL(): string {
    return this.configService.get<string>('JWT_ACCESS_TTL', '15m');
  }

  getJwtRefreshTTL(): string {
    return this.configService.get<string>('JWT_REFRESH_TTL', '7d');
  }

  getJwtSecret(): string {
    return this.configService.getOrThrow<string>('JWT_SECRET');
  }
}