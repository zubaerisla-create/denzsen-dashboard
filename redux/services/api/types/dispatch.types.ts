export interface Dispatch {
  id: number;
  case_number: string;
  lat: number;
  long: number;
  address: string;
  description: string;
  max_slots: number;
  slots_filled: number;
  points: number;
  status: string;
  date: string;
  formatted_date?: string;
  time_ago?: string;
}

export interface CreateDispatchRequest {
  case_number: string;
  lat: number;
  long: number;
  address: string;
  description: string;
  max_slots: number;
  points: number;
  status?: string;
}
