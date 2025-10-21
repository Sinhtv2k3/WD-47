import type { CustomerDto } from "../models/AdminModel";

const BASEADMIN = "http://127.0.0.1:9000/api/admin";

export class AdminController {
  public static initialize(): void {}

  static async getCustomers(): Promise<CustomerDto[]> {
    const res = await fetch(`${BASEADMIN}/customers`);
    if (!res.ok) throw new Error("Failed to fetch customers");
    const data = await res.json();
    return data.data;
  }
  // static async getCustomers(): Promise<CustomerDto[]> {
  //   const res = await fetch(`${BASEADMIN}/customers`);
  //   if (!res.ok) throw new Error("Failed to fetch customers");
  //   // debug:
  //   const data = await res.clone().json();
  //   console.log('Fetched customers:', data);
  //   return res.json();
  // }

  static async getCustomer(id: string): Promise<CustomerDto> {
    const res = await fetch(`${BASEADMIN}/customers/${id}`);
    if (!res.ok) throw new Error("Failed to fetch customer");
    const data = await res.json();
    return data.data;
  }

  static async createCustomer(
    payload: Omit<CustomerDto, "id">
  ): Promise<CustomerDto> {
    const res = await fetch(`${BASEADMIN}/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create customer");
    return res.json();
  }

  static async updateCustomer(
    id: string,
    payload: Partial<Omit<CustomerDto, "id">>
  ): Promise<CustomerDto> {
    const res = await fetch(`${BASEADMIN}/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update customer");
    return res.json();
  }

  static async deleteCustomer(id: string): Promise<void> {
    const res = await fetch(`${BASEADMIN}/customers/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete customer");
  }
}

export default AdminController;
