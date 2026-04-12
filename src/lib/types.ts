export interface Product {
  name: string;
  slug: string;
  manufacturer: string;
  category: string;
  chipset?: string;
  vram?: string;
  base_clock?: string;
  boost_clock?: string;
  tdp?: string;
  socket?: string;
  cores?: string;
  threads?: string;
  capacity?: string;
  speed?: string;
  form_factor?: string;
  interface?: string;
  wattage?: string;
  efficiency?: string;
  color?: string;
  side_panel?: string;
  description?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  role: 'user' | 'admin';
}
