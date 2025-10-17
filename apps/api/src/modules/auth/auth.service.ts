import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user/user.entity';
import { LoginDto } from '../../dto/login.dto';
import { LoginResponseDto } from '../../dto/login-response.dto';
import { PermissionsService } from '../permission/permission.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly permissionsService: PermissionsService
  ) {}

  /**
   * Validate user credentials
   * @param email - User email
   * @param password - Plain text password
   * @returns User if valid, null otherwise
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return null;
    }

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Login user and return JWT token
   * @param loginDto - Login credentials
   * @returns Access token and user info
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
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

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: highestRole,
      },
    };
  }

  /**
   * Get user by ID
   * @param userId - User ID
   * @returns User entity
   */
  async findUserById(userId: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return user;
  }
}
