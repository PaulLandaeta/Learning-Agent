export interface ConfigPort {

  getJwtAccessTTL(): string;

  getJwtRefreshTTL(): string;

  getJwtSecret(): string;

}
