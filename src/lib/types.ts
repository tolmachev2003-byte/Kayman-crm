export interface Trainer {
  id: string;
  name: string;
  phone: string | null;
  archived_at: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  role: "admin" | "trainer";
  trainer_id: string | null;
}

export interface Client {
  id: string;
  child_full_name: string;
  parent_name: string | null;
  parent_phone: string | null;
  birth_date: string | null;
  subscription_type: "1" | "4" | "8" | null;
  comment: string | null;
  status: "записался" | "ходит" | "ходил";
  assigned_trainer_id: string | null;
  archived_at: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  trainer_id: string;
  client_id: string | null;
  date: string;
  time_slot: string;
  client_type: "новый" | "постоянный" | "пробный" | "абонемент";
  archived_at: string | null;
  created_at: string;
  // joined
  clients?: Client;
  trainers?: Trainer;
}

export interface Template {
  id: string;
  trainer_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface TemplateAssignment {
  id: string;
  trainer_id: string;
  day_of_week: number;
  time_slot: string;
  client_id: string;
  client_type: string;
  clients?: Client;
}

export interface Task {
  id: string;
  user_id: string;
  client_id: string | null;
  due_date: string;
  text: string;
  status: "open" | "done";
  created_at: string;
  clients?: Client;
}
