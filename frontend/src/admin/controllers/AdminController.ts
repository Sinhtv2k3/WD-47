import type { CustomerDto } from '../models/AdminModel';

const BASE = '/api';

export class AdminController {
  public static initialize(): void {}

  static async getCustomers(): Promise<CustomerDto[]> {
    const res = await fetch(`${BASE}/customers`);
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  }

  static async createCustomer(payload: Omit<CustomerDto, 'id'>): Promise<CustomerDto> {
    const res = await fetch(`${BASE}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create customer');
    return res.json();
  }

  static async updateCustomer(id: number, payload: Partial<Omit<CustomerDto, 'id'>>): Promise<CustomerDto> {
    const res = await fetch(`${BASE}/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update customer');
    return res.json();
  }

  static async deleteCustomer(id: number): Promise<void> {
    const res = await fetch(`${BASE}/customers/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete customer');
  }
}

export default AdminController;


