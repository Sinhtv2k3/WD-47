export interface AdminModel {
  id: string;
  name: string;
}

export interface Role {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  pivot: {
    user_id: number;
    role_id: number;
  };
}

export interface CustomerDto {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  phone: string;
  address: string;
  dob: string;
  gender: 'male' | 'female';
  status: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  roles: Role[];
  password?: string;
}

