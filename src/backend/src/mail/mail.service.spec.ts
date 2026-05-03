import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';

describe('MailService', () => {
  let service: MailService;
  const mailerService = {
    sendMail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: MailerService, useValue: mailerService },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('sends a password reset email', async () => {
    await service.sendPasswordResetEmail(
      'user@example.com',
      'Known User',
      'http://localhost:3001/reset-password?token=abc',
    );

    expect(mailerService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: 'Atur Ulang Kata Sandi Anda',
        text: expect.stringContaining(
          'http://localhost:3001/reset-password?token=abc',
        ),
        html: expect.stringContaining(
          'Silakan klik tautan berikut untuk mengatur ulang kata sandi Anda:',
        ),
      }),
    );
  });
});
