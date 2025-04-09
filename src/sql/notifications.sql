
-- Create notifications table for the notification system
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies for the notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications" 
  ON public.notifications 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'system',
  language TEXT NOT NULL DEFAULT 'en',
  notification_settings JSONB NOT NULL DEFAULT '{"email": true, "push": true, "high_risk_alerts": true, "weekly_digest": true, "model_training_complete": true}'::jsonb,
  risk_threshold INTEGER NOT NULL DEFAULT 70,
  default_departments TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add RLS policies for user preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view their own preferences" 
  ON public.user_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update their own preferences" 
  ON public.user_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert their own preferences" 
  ON public.user_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies for audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view audit logs
CREATE POLICY "Authenticated users can view audit logs" 
  ON public.audit_logs 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Create trigger function to add notifications on important events
CREATE OR REPLACE FUNCTION public.handle_ml_events()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND TG_TABLE_NAME = 'ml_models') THEN
    -- Add notification for new model creation
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.user_id,
      'Model Training Complete',
      'Your model "' || NEW.name || '" has been successfully trained and saved.',
      'success'
    );
    
    -- Log the event to audit logs
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
    VALUES (
      NEW.user_id,
      'create',
      'model',
      NEW.id,
      jsonb_build_object('name', NEW.name, 'model_type', NEW.model_type)
    );
    
  ELSIF (TG_OP = 'INSERT' AND TG_TABLE_NAME = 'predictions') THEN
    -- Add notification for high risk predictions
    IF (NEW.prediction_result->>'risk' = 'high') THEN
      INSERT INTO public.notifications (user_id, title, message, type)
      VALUES (
        NEW.user_id,
        'High Risk Employee Detected',
        'A prediction has identified a high risk employee. Review the prediction details.',
        'warning'
      );
    END IF;
    
    -- Log the prediction to audit logs
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
    VALUES (
      NEW.user_id,
      'predict',
      'prediction',
      NEW.id,
      jsonb_build_object(
        'risk', NEW.prediction_result->>'risk',
        'employee_id', NEW.employee_id,
        'model_id', NEW.model_id
      )
    );
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER ml_model_created_trigger
  AFTER INSERT ON public.ml_models
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_ml_events();

CREATE TRIGGER prediction_created_trigger
  AFTER INSERT ON public.predictions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_ml_events();

-- Real-time notifications setup
-- Enable the realtime feature for the notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
