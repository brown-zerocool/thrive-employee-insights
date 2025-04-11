import { supabase, fromAuditLogs } from "@/integrations/supabase/customClient";

type AuditAction = 
  | "create" 
  | "update" 
  | "delete" 
  | "predict" 
  | "export" 
  | "import" 
  | "login" 
  | "logout";

type EntityType = 
  | "employee" 
  | "model" 
  | "prediction" 
  | "data" 
  | "user" 
  | "system";

interface AuditLogParams {
  action: AuditAction;
  entity_type: EntityType;
  entity_id?: string;
  details: Record<string, any>;
  user_id?: string;
}

export const logAuditEvent = async ({
  action,
  entity_type,
  entity_id,
  details,
  user_id
}: AuditLogParams): Promise<void> => {
  try {
    // If no user_id is provided, get the current user
    const currentUserId = user_id || (await supabase.auth.getUser()).data.user?.id;
    
    if (!currentUserId) {
      console.warn("Could not log audit event: No user ID available");
      return;
    }
    
    // Get the IP address (this would typically be handled by the server)
    const ip_address = "127.0.0.1"; // Placeholder for client-side logging
    
    const { error } = await fromAuditLogs()
      .insert({
        user_id: currentUserId,
        action,
        entity_type,
        entity_id,
        details,
        ip_address
      });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
};

export const logEmployeeAction = async (
  action: AuditAction,
  employeeId: string,
  details: Record<string, any>,
  userId?: string
) => {
  return logAuditEvent({
    action,
    entity_type: "employee",
    entity_id: employeeId,
    details,
    user_id: userId
  });
};

export const logModelAction = async (
  action: AuditAction,
  modelId: string,
  details: Record<string, any>,
  userId?: string
) => {
  return logAuditEvent({
    action,
    entity_type: "model",
    entity_id: modelId,
    details,
    user_id: userId
  });
};

export const logPredictionAction = async (
  action: AuditAction,
  predictionId: string,
  details: Record<string, any>,
  userId?: string
) => {
  return logAuditEvent({
    action,
    entity_type: "prediction",
    entity_id: predictionId,
    details,
    user_id: userId
  });
};

export const logAuthAction = async (
  action: "login" | "logout",
  details: Record<string, any>,
  userId?: string
) => {
  return logAuditEvent({
    action,
    entity_type: "user",
    details,
    user_id: userId
  });
};

export const logSystemAction = async (
  action: AuditAction,
  details: Record<string, any>,
  userId?: string
) => {
  return logAuditEvent({
    action,
    entity_type: "system",
    details,
    user_id: userId
  });
};
