import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.getOrThrow<string>('mail.host');
        const user = configService.getOrThrow<string>('mail.user');
        const pass = configService.getOrThrow<string>('mail.pass');
        const shouldUseAuth = Boolean(
          user && pass && !host.includes('mailpit'),
        );

        return {
          transport: {
            host,
            port: configService.getOrThrow<number>('mail.port'),
            secure: configService.getOrThrow<boolean>('mail.secure'),
            connectionTimeout: 5000,
            greetingTimeout: 5000,
            socketTimeout: 5000,
            ...(shouldUseAuth ? { auth: { user, pass } } : {}),
          },
          defaults: {
            from: configService.getOrThrow<string>('mail.from'),
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
