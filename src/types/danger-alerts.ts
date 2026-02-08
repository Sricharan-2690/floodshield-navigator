export type DangerAlert = {
  id: string;
  user_id: string;
  location_text: string;
  lat: number;
  lng: number;
  message: string;
  photo_url: string | null;
  created_at: string;
  expires_at: string;
};

export type DangerAlertComment = {
  id: string;
  alert_id: string;
  user_id: string;
  comment: string;
  created_at: string;
};

export type DangerAlertVote = {
  id: string;
  alert_id: string;
  user_id: string;
  vote: -1 | 1;
  created_at: string;
  updated_at: string;
};
