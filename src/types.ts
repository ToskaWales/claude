export interface Service {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;    // EUR
}

export interface AvailableBlock {
  id: string;
  date: string;      // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
}

export interface Booking {
  id: string;
  date: string;      // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  serviceId: string;
  customerName: string;
  customerPhone: string;
  notes: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface AppState {
  businessName: string;
  adminPassword: string;
  services: Service[];
  blocks: AvailableBlock[];
  bookings: Booking[];
}
