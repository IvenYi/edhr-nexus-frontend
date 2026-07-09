export interface LoginParams {
  username: string;
  password: string;
}

export interface PasswordParams {
  userId: string | number;
  newPassword: string;
  oldPassword: string;
  type?: string;
}

export interface UserSettigParams {
  avatar: string;
  email?: string;
  fullname: string;
  mobile?: string;
}
