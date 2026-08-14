import { Customer } from '../types';
import { Repository } from '../db/storage';

export class CustomerService {
  /**
   * Customer Directory Service.
   * TODO: Connect real Customer API backend when API specification is provided.
   */

  static getAllCustomers(): Customer[] {
    return Repository.getCustomers();
  }

  static getCustomerById(id: string): Customer | undefined {
    return Repository.getCustomers().find(c => c.id === id);
  }

  static saveCustomer(customerData: Partial<Customer> & { companyName: string; email: string; contactName: string }): { success: boolean; message: string; customer?: Customer } {
    if (!customerData.email || !customerData.email.includes('@')) {
      return { success: false, message: 'A valid email address is required.' };
    }

    if (!customerData.companyName || !customerData.companyName.trim()) {
      return { success: false, message: 'Company name is required.' };
    }

    const customers = Repository.getCustomers();

    if (customerData.id) {
      const idx = customers.findIndex(c => c.id === customerData.id);
      if (idx === -1) return { success: false, message: 'Customer not found.' };

      customers[idx] = {
        ...customers[idx],
        ...customerData,
      };

      Repository.saveCustomers(customers);
      return { success: true, message: 'Customer updated.', customer: customers[idx] };
    } else {
      const newCust: Customer = {
        id: `cust_${Math.random().toString(36).substring(2, 9)}`,
        companyName: customerData.companyName.trim(),
        contactName: customerData.contactName?.trim() || customerData.companyName.trim(),
        email: customerData.email.trim().toLowerCase(),
        phone: customerData.phone?.trim() || '',
        vatNumber: customerData.vatNumber?.trim(),
        address: customerData.address || { street: '', city: 'Johannesburg', province: 'Gauteng', postalCode: '' },
        createdAt: new Date().toISOString(),
      };

      customers.push(newCust);
      Repository.saveCustomers(customers);
      return { success: true, message: 'Customer saved successfully.', customer: newCust };
    }
  }
}
