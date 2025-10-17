import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from '../models/data.types';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login user', () => {
    const mockCredentials: LoginDto = {
      email: 'test@example.com',
      password: 'password123'
    };

    const mockResponse: LoginResponseDto = {
      accessToken: 'mock-token',
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User'
      }
    };

    service.login(mockCredentials).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCredentials);
    req.flush(mockResponse);
  });

  it('should logout user', () => {
    service.logout().subscribe(response => {
      expect(response).toBeUndefined();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/logout`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should refresh token', () => {
    const mockResponse = { accessToken: 'new-token' };

    service.refreshToken().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/refresh`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should check if token is valid', () => {
    // Create a valid JWT token with future expiration
    const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ exp: futureTime, sub: 'user123' }));
    const signature = 'signature';
    const validToken = `${header}.${payload}.${signature}`;
    
    (localStorage.getItem as jest.Mock).mockReturnValue(validToken);
    
    expect(service.isTokenValid()).toBeTruthy();
  });

  it('should return false for invalid token', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
    
    expect(service.isTokenValid()).toBeFalsy();
  });

  it('should return false for expired token', () => {
    // Create an expired JWT token
    const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ exp: pastTime, sub: 'user123' }));
    const signature = 'signature';
    const expiredToken = `${header}.${payload}.${signature}`;
    
    (localStorage.getItem as jest.Mock).mockReturnValue(expiredToken);
    
    expect(service.isTokenValid()).toBeFalsy();
  });
});
