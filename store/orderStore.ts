
import { Order, AdminLogEntry, User } from '../types';

const STORAGE_KEY = 'smart_booking_orders';
const LOGS_KEY = 'smart_booking_admin_logs';
const USERS_KEY = 'smart_booking_users';
const SETTINGS_KEY = 'smart_booking_settings';

// Default Admin for first run
const DEFAULT_ADMIN: User = {
  id: 'admin-001',
  name: 'Super Admin',
  username: 'admin',
  pin: 'Oman@2026@',
  role: 'admin',
  createdAt: new Date().toISOString()
};

export const getOrders = (): Order[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveOrder = (order: Order): void => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === order.id);
  if (index >= 0) {
    orders[index] = order;
  } else {
    orders.push(order);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

export const deleteOrder = (id: string): void => {
  const orders = getOrders();
  const filtered = orders.filter(o => o.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const getOrderById = (id: string): Order | undefined => {
  return getOrders().find(o => o.id === id);
};

export const getOrdersByPin = (pin: string): Order[] => {
  return getOrders().filter(o => o.customerPin === pin);
};

export const getOrdersByPhoneAndPin = (phone: string, pin: string): Order[] => {
  return getOrders().filter(o => o.customerPhone === phone && o.customerPin === pin);
};

export const getAdminLogs = (): AdminLogEntry[] => {
  const data = localStorage.getItem(LOGS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveAdminLog = (log: AdminLogEntry): void => {
  const logs = getAdminLogs();
  logs.unshift(log); 
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 500)));
};

// --- USER MANAGEMENT ---

export const getUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  if (!data) {
    localStorage.setItem(USERS_KEY, JSON.stringify([DEFAULT_ADMIN]));
    return [DEFAULT_ADMIN];
  }
  return JSON.parse(data);
};

export const isPinUnique = (pin: string, excludeId?: string): boolean => {
  const users = getUsers();
  return !users.some(u => u.pin === pin && u.id !== excludeId);
};

export const isUsernameUnique = (username: string, excludeId?: string): boolean => {
  const users = getUsers();
  return !users.some(u => u.username === username && u.id !== excludeId);
};

export const saveUser = (user: User): boolean => {
  if (!isUsernameUnique(user.username, user.id)) return false;
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return true;
};

export const deleteUser = (id: string): boolean => {
  const users = getUsers();
  // Don't allow deleting the last admin
  const userToDelete = users.find(u => u.id === id);
  if (userToDelete?.role === 'admin' && users.filter(u => u.role === 'admin').length === 1) {
    return false;
  }
  const filtered = users.filter(u => u.id !== id);
  localStorage.setItem(USERS_KEY, JSON.stringify(filtered));
  return true;
};

export const authenticateUser = (idOrUsernameOrPhone: string, pin: string): User | undefined => {
  const users = getUsers();
  
  // 1. Check predefined users (Staff/Admin)
  const user = users.find(u => u.username.toLowerCase() === idOrUsernameOrPhone.toLowerCase() && u.pin === pin);
  if (user) return user;

  // 2. Check orders for customer tracking (ID, Name, or Phone match)
  const orders = getOrders();
  const order = orders.find(o => 
    (o.id.toLowerCase() === idOrUsernameOrPhone.toLowerCase() || 
     o.customerName.toLowerCase() === idOrUsernameOrPhone.toLowerCase() ||
     o.customerPhone === idOrUsernameOrPhone) 
    && o.customerPin === pin
  );
  
  if (order) {
    return {
      id: `cust-${order.customerPhone}`,
      name: order.customerName,
      username: order.customerPhone, // Use phone as unique username for customers
      pin: order.customerPin,
      role: 'customer',
      createdAt: order.createdAt
    };
  }

  return undefined;
};

interface UniqueCustomer {
  name: string;
  phone: string;
  pin: string;
  orderCount: number;
  lastOrder: string;
}

export const getUniqueCustomers = (): UniqueCustomer[] => {
  const orders = getOrders();
  const customerMap = new Map<string, UniqueCustomer>();
  
  orders.forEach(o => {
    const key = o.customerPhone + o.customerPin; // Unique combination
    const existing = customerMap.get(key);
    if (!existing) {
      customerMap.set(key, {
        name: o.customerName,
        phone: o.customerPhone,
        pin: o.customerPin,
        orderCount: 1,
        lastOrder: o.createdAt
      });
    } else {
      existing.orderCount += 1;
      if (new Date(o.createdAt) > new Date(existing.lastOrder)) {
        existing.lastOrder = o.createdAt;
      }
    }
  });
  
  return Array.from(customerMap.values());
};

// --- SETTINGS ---
export const getVatRate = (): number => {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (data) {
    const settings = JSON.parse(data);
    return settings.vatRate || 0;
  }
  return 0;
};

export const saveVatRate = (rate: number): void => {
  const data = localStorage.getItem(SETTINGS_KEY);
  const settings = data ? JSON.parse(data) : {};
  settings.vatRate = rate;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const getShopPhone = (): string => {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (data) {
    const settings = JSON.parse(data);
    return settings.shopPhone || '';
  }
  return '';
};

export const saveShopPhone = (phone: string): void => {
  const data = localStorage.getItem(SETTINGS_KEY);
  const settings = data ? JSON.parse(data) : {};
  settings.shopPhone = phone;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

// Legacy support
export const findUserByPin = (pin: string): User | undefined => {
  return getUsers().find(u => u.pin === pin);
};
