
export interface MLModel {
  id: string;
  name: string;
  model_type: string;
  features: string[];
  description?: string;
  parameters?: Record<string, any>;
  metrics?: {
    accuracy?: number;
    rmse?: number;
    mse?: number;
    r2?: number;
    [key: string]: any;
  };
  model_data?: any;
  training_date: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Prediction {
  id: string;
  employee_id?: string;
  model_id?: string;
  user_id: string;
  prediction_date: string;
  prediction_result: {
    risk: 'low' | 'medium' | 'high';
    probability?: number;
    [key: string]: any;
  };
  confidence_score?: number;
  factors?: Record<string, any>;
  time_frame?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

export interface UserPreferences {
  id?: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notification_settings: {
    email: boolean;
    push: boolean;
    high_risk_alerts: boolean;
    weekly_digest: boolean;
    model_training_complete: boolean;
  };
  risk_threshold: number;
  default_departments: string[];
  created_at?: string;
  updated_at?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  created_at: string;
  user_email?: string;
}

export interface ModelComparison {
  id: string;
  name: string;
  modelType: string;
  accuracy: number;
  rmse: number;
  mse: number;
  r2: number;
  createdAt: string;
  featureCount: number;
  features: string[];
  parameters: Record<string, any>;
}
