import type { ServiceDetail, ServiceRow, Discount } from "../models/AdminModel";

const BASE = "http://127.0.0.1:8000/api";


export class AdminController {
  // === Lấy danh sách dịch vụ ===
  public static async getServices(): Promise<ServiceRow[]> {
    const res = await fetch(`${BASE}/services`);
    if (!res.ok) throw new Error("Fetch services failed");
    const json = await res.json();
    return json.data ?? json;
  }

  // === Lấy chi tiết 1 dịch vụ ===
  public static async getService(id: string): Promise<ServiceDetail> {
    const res = await fetch(`${BASE}/services/${id}`);
    if (!res.ok) throw new Error("Fetch service detail failed");
    const json = await res.json();
    const data = json.data ?? json;

    return {
      ...data,
      created_at: data.created_at ?? new Date().toISOString(),
      updated_at: data.updated_at ?? new Date().toISOString(),
    };
  }

  // === Lấy danh sách mã giảm giá ===
  public static async getDiscounts(): Promise<Discount[]> {
    const res = await fetch(`${BASE}/discounts`);
    if (!res.ok) throw new Error("Fetch discounts failed");
    const json = await res.json();
    return json.data ?? json;
  }

  // === Thêm dịch vụ ===
  public static async addService(data: ServiceRow): Promise<void> {
    const res = await fetch(`${BASE}/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add service");
  }

  // === Cập nhật dịch vụ ===
  public static async updateService(
    id: number,
    data: Partial<ServiceRow>
  ): Promise<void> {
    const res = await fetch(`${BASE}/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update service");
  }

  // === Upload ảnh dịch vụ ===
  public static async uploadServiceImage(id: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${BASE}/services/${id}/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Upload ảnh thất bại");
  }

  // === Xóa dịch vụ ===
  public static async deleteService(id: number): Promise<void> {
    const res = await fetch(`${BASE}/services/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete service");
  }
}

export default AdminController;
