import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { PermissionsService } from '../../permission/permission.service';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly permissionsService: PermissionsService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env['JWT_SECRET'] || 'your-super-secret-jwt-key',
    });
  }

  /**
   * Validate JWT payload and return user
   * @param payload - JWT payload
   * @returns User object attached to request
   */
  async validate(payload: JwtPayload) {
    const user = await this.authService.findUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Get user's highest role across all organizations
    const accessibleOrgIds = await this.permissionsService.getUserOrganizations(user.id);
    let highestRole = 'VIEWER'; // Default role
    
    if (accessibleOrgIds.length > 0) {
      // Check roles in all accessible organizations to find the highest one
      for (const orgId of accessibleOrgIds) {
        const effectiveRole = await this.permissionsService.getEffectiveRole(user.id, orgId);
        if (effectiveRole) {
          // Role hierarchy: OWNER > ADMIN > VIEWER
          if (effectiveRole === 'OWNER') {
            highestRole = 'OWNER';
            break; // OWNER is the highest, no need to check further
          } else if (effectiveRole === 'ADMIN' && highestRole !== 'OWNER') {
            highestRole = 'ADMIN';
          }
        }
      }
    }

    // This will be attached to request.user
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: highestRole,
    };
  }
}
