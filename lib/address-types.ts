export type Address = {
  id: string;
  full_name: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
};

export type AddressState = { status: 'idle' | 'error' | 'success'; message?: string };
export const initialAddressState: AddressState = { status: 'idle' };
