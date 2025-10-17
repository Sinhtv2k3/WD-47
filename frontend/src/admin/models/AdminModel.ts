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


export interface ServiceRow {
  id : number;
  name : string;
  price: number;
  dob:string;
   created_at: string;
  updated_at: string;
  deleted_at: string | null;
  roles: Role[];
   status: "active" | "paused" | "deleted";
}

