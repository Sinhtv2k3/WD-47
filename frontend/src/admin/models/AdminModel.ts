

export interface ServiceRow {
  id: number;
  name: string;
  type: "single" | "combo";
  price: number;
  status: "active" | "paused" | "deleted";
  comboServices?: number[]; 
  discount_id?: number; 
  images?: string[]; 
}

export interface Discount {
  id: number;
  code: string;
  type: "percent" | "amount"; 
  value: number;
}

export interface ServiceDetail extends ServiceRow {
  created_at?: string;
  updated_at?: string;
}
