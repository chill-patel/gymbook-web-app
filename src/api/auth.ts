import client from './client';
import type {
  AuthResponse,
  EmailExistRequest,
  EmailExistResponse,
  LoginRequest,
  SignUpRequest,
  SignUpResponse,
} from './types';

export const loginAPI = (body: LoginRequest) =>
  client.post<unknown, AuthResponse>('/subscriber/login', body);

export const signUpAPI = (body: SignUpRequest) =>
  client.post<unknown, SignUpResponse>('/subscriber/SignUp', body);

export const checkEmailExistAPI = (body: EmailExistRequest) =>
  client.post<unknown, EmailExistResponse>('/subscriber/email-exist', body);

export const forgetPasswordAPI = (body: { email: string }) =>
  client.post('/subscriber/forget-password', body);

export const loginWithGoogleAPI = (token: string) =>
  client.post<unknown, AuthResponse>('/subscriber/login-with-google', { token });

export const logoutAPI = () => client.get('/subscriber/logout');

export const deleteAccountAPI = (password: string) =>
  client.delete('/subscriber/account', { data: { password } });

export const deleteGymBranchAPI = (password: string, subID: string) =>
  client.delete('/subscriber/branch', { data: { password, subID } });
