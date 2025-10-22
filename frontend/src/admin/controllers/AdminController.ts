import type { ServiceRow, Discount } from "../models/AdminModel";

const BASE = "http://localhost:3000";

export class AdminController {
  // === Lấy danh sách dịch vụ ===
  public static async getServices(): Promise<ServiceRow[]> {
    const res = await fetch(`${BASE}/services`);
    if (!res.ok) throw new Error("Fetch services failed");
    return res.json();
  }

  // === Lấy mã giảm giá ===
  public static async getDiscounts(): Promise<Discount[]> {
    const res = await fetch(`${BASE}/discounts`);
    if (!res.ok) throw new Error("Fetch discounts failed");
    return res.json();
  }

  // === Thêm dịch vụ ===
  public static async addService(data: ServiceRow): Promise<void> {
    await fetch(`${BASE}/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  // === Cập nhật dịch vụ ===
  public static async updateService(id: number, data: Partial<ServiceRow>): Promise<void> {
    await fetch(`${BASE}/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  // === Xóa dịch vụ ===
  public static async deleteService(id: number): Promise<void> {
    await fetch(`${BASE}/services/${id}`, { method: "DELETE" });
  }
}
