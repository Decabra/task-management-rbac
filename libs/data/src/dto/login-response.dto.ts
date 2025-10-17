export interface LoginResponseDto {
  accessToken: string;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}
