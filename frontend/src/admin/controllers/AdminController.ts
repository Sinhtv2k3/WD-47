import type { ServiceDetail, ServiceRow, Discount } from "../models/AdminModel";

const BASEADMIN = "http://127.0.0.1:8000/api/admin";

export class AdminController {
  // === Lấy danh sách dịch vụ ===
  public static async getServices(): Promise<ServiceRow[]> {
    const res = await fetch(`${BASEADMIN}/services`);
    if (!res.ok) throw new Error("Fetch services failed");
    return res.json();
  }

 // === Lấy chi tiết 1 dịch vụ ===
    public static async getService(id: string): Promise<ServiceDetail> {
    const res = await fetch(`${BASEADMIN}/services/${id}`);
    if (!res.ok) throw new Error("Fetch service detail failed");

    // Giả lập dữ liệu có created_at, updated_at nếu backend chưa có
    const data = await res.json();
    return {
      ...data,
      created_at: data.created_at ?? new Date().toISOString(),
      updated_at: data.updated_at ?? new Date().toISOString(),
    };
  }
  // === Lấy mã giảm giá ===
  public static async getDiscounts(): Promise<Discount[]> {
    const res = await fetch(`${BASEADMIN}/discounts`);
    if (!res.ok) throw new Error("Fetch discounts failed");
    return res.json();
  }

  // === Thêm dịch vụ ===
  public static async addService(data: ServiceRow): Promise<void> {
    await fetch(`${BASEADMIN}/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  // === Cập nhật dịch vụ ===
  public static async updateService(id: number, data: Partial<ServiceRow>): Promise<void> {
    await fetch(`${BASEADMIN}/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }
  // === update image=== 
  public static async uploadServiceImage(id:string, file: File): Promise<void>{
    const formData = new FormData();
    formData.append("image",file);

    const res = await fetch(`${BASEADMIN}/services/${id}/upload`,{
      method : "POST",
      body: formData,
    });
    if(!res.ok) throw new Error("Upload ảnh thất bại");
  }
  // === Xóa dịch vụ ===
  public static async deleteService(id: number): Promise<void> {
    await fetch(`${BASEADMIN}/services/${id}`, { method: "DELETE" });
  }
}
