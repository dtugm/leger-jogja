import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './services/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    requestPasswordReset: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    authService.requestPasswordReset.mockResolvedValue({
      message:
        'If the email is registered, a password reset link will be sent.',
    });
    authService.resetPassword.mockResolvedValue({
      message: 'Password has been reset successfully.',
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = moduleFixture.get<AuthController>(AuthController);
  });

  const getGuardMetadata = (methodName: keyof AuthController): unknown => {
    const descriptor = Object.getOwnPropertyDescriptor(
      AuthController.prototype,
      methodName,
    ) as { value?: unknown } | undefined;
    const method: unknown = descriptor?.value;

    if (typeof method !== 'function') {
      return undefined;
    }

    const target: object = method;

    return Reflect.getMetadata(GUARDS_METADATA, target) as unknown;
  };

  it('keeps forgot-password public by not applying any guards', () => {
    expect(getGuardMetadata('forgotPassword')).toBe(undefined);
  });

  it('keeps reset-password public by not applying any guards', () => {
    expect(getGuardMetadata('resetPassword')).toBe(undefined);
  });

  it('keeps login guarded with the local auth guard', () => {
    expect(getGuardMetadata('login')).toEqual([LocalAuthGuard]);
  });

  it('forwards forgot-password requests to auth service', async () => {
    await expect(
      controller.forgotPassword({ email: 'user@example.com' }),
    ).resolves.toEqual({
      message:
        'If the email is registered, a password reset link will be sent.',
    });

    expect(authService.requestPasswordReset).toHaveBeenCalledWith(
      'user@example.com',
    );
  });

  it('forwards reset-password requests to auth service', async () => {
    await expect(
      controller.resetPassword({
        token: 'reset-token',
        newPassword: 'new-password-123',
      }),
    ).resolves.toEqual({
      message: 'Password has been reset successfully.',
    });

    expect(authService.resetPassword).toHaveBeenCalledWith(
      'reset-token',
      'new-password-123',
    );
  });
});
