import { Test, ExecutionContext } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { RbacGuard } from './rbac.guard';
import { Role } from '@libs/data';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RbacGuard', () => {
  let guard: RbacGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RbacGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RbacGuard>(RbacGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when no roles are required', () => {
      const context = createMockContext();
      mockReflector.getAllAndOverride.mockReturnValue(undefined);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return true when user has required role', () => {
      const context = createMockContext({ role: Role.ADMIN });
      mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN, Role.OWNER]);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return false when user does not have required role', () => {
      const context = createMockContext({ role: Role.VIEWER });
      mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN, Role.OWNER]);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return false when user is not authenticated', () => {
      const context = createMockContext(null);
      mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return true when user has one of multiple required roles', () => {
      const context = createMockContext({ role: Role.VIEWER });
      mockReflector.getAllAndOverride.mockReturnValue([Role.VIEWER, Role.ADMIN, Role.OWNER]);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  function createMockContext(user: any = { role: Role.ADMIN }): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;
  }
});
