export interface LoginResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}
