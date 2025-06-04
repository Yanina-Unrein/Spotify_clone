import { User } from "./UserModel";

export interface RegisterData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  fieldErrors?: FieldError[];
  rawError?: any;
  isEmailExists?: boolean;
}

export interface RegisterResponse {
  token: string;
  user: User;
}