import type { ServiceRow } from "../models/AdminModel";
const BASE = "/api";
export class AdminController {
  // Add controller methods to orchestrate admin view interactions
  public static initialize(): void { }
  
  static async getServices(): Promise<ServiceRow[]> {
    const res = await fetch(`${BASE}/services`);
    if (!res.ok) throw new Error("Failed to fetch services");
    return res.json();
  }
   static async createService(payload: Partial<ServiceRow>): Promise<ServiceRow> {
    const res = await fetch(`${BASE}/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create service");
    // backend phải trả về service mới với id
    return res.json();
  }
    static async updateService(id: number, payload: Partial<ServiceRow>): Promise<void> {
    const res = await fetch(`${BASE}/services/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update service");
  }
   static async updateServiceStatus(id: number, status: string): Promise<void> {
    const res = await fetch(`${BASE}/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update status");
  }
   static async deleteService(id: number): Promise<void> {
    const res = await fetch(`${BASE}/services/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete service");
  }
}

export default AdminController;


