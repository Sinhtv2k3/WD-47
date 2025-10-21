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

export interface Point {
  id: number;
  current_points: number;
  total_points: number;
  used_points: number;
  created_at: string;
  updated_at: string;
}

export interface Rank {
  id: number;
  name: string;
  min_total_points: number;
  discount_percent: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  phone?: string;
}

export interface CustomerDto {
  id: number;
  user_id: number;
  face_shape: string;
  hair_texture: string;
  point_id: number;
  rank_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user: User;
  rank: Rank;
  point: Point;
}

