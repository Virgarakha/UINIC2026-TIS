export type ApiPlanTier = "free" | "pro" | "enterprise";

export interface ApiSubscription {
  id: number;
  user_id: number;
  plan_tier: ApiPlanTier;
  status: "active" | "inactive" | "canceled";
  requests_limit: number;
  requests_used: number;
  rate_limit_per_minute: number;
  billing_cycle: string;
  started_at: string;
  expires_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ApiKeyItem {
  id: number;
  user_id: number;
  name: string;
  key_prefix: string;
  plain_token?: string | null;
  key_hash?: string;
  is_active: boolean;
  requests_count: number;
  last_used_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ApiRequestLogItem {
  id: number;
  user_id?: number | null;
  api_key_id?: number | null;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  ip_address: string;
  created_at: string;
}

export interface DeveloperSummary {
  user_id: number;
  user_name: string;
  user_email: string;
  active_keys_count: number;
  quota_percentage: number;
  avg_latency_ms: number;
  uptime_percentage: string;
}
