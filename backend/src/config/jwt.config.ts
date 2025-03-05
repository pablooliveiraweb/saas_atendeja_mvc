import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs(
  'jwt',
  (): {
    access: JwtModuleOptions;
    refresh: JwtModuleOptions;
  } => ({
    access: {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRATION || '1h',
      },
    },
    refresh: {
      secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      signOptions: {
        expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
      },
    },
  }),
);
