
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
