import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase, fromAuditLogs, fromProfiles } from "@/integrations/supabase/customClient";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { Download, Filter, Search, User, Database, FileEdit, Trash, AlertCircle, ChevronRight, ChevronLeft } from "lucide-react";

interface AuditLog {
  id: string;
  user_id: string;
  action: "create" | "update" | "delete" | "predict" | "export" | "import" | "login" | "logout";
  entity_type: "employee" | "model" | "prediction" | "data" | "user" | "system";
  entity_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  created_at: string;
  user_email?: string;
}

const AuditLogPanel = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    action: "",
    entity_type: "",
    searchTerm: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user) {
      fetchAuditLogs();
    }
  }, [session, page, filter]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      let query = fromAuditLogs()
        .select('*')
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      // Apply filters
      if (filter.action) {
        query = query.eq("action", filter.action);
      }
      
      if (filter.entity_type) {
        query = query.eq("entity_type", filter.entity_type);
      }
      
      // We'll handle search filtering differently since it involves multiple fields
      const { data: auditLogs, error, count } = await query;
      
      if (error) throw error;
      
      // Get user emails for the logs
      const userIds = Array.from(new Set(auditLogs?.map(log => log.user_id) || []));
      const userEmailsMap = new Map<string, string>();
      
      if (userIds.length > 0) {
        const { data: profiles } = await fromProfiles()
          .select('id, email')
          .in('id', userIds);
          
        profiles?.forEach(profile => {
          userEmailsMap.set(profile.id, profile.email);
        });
      }
      
      // Enrich logs with user emails
      const logsWithEmail = auditLogs?.map(log => ({
        ...log,
        user_email: userEmailsMap.get(log.user_id) || 'Unknown User'
      })) || [];
      
      // Apply text search filtering client-side 
      // (in a production app, this should be done in the database)
      const filteredLogs = filter.searchTerm 
        ? logsWithEmail.filter(log => 
            log.user_email?.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
            (log.details && JSON.stringify(log.details).toLowerCase().includes(filter.searchTerm.toLowerCase()))
          )
        : logsWithEmail;

      setLogs(filteredLogs as AuditLog[]);
      setTotalPages(Math.ceil((count || filteredLogs.length) / pageSize));
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchAuditLogs();
  };

  const resetFilters = () => {
    setFilter({
      action: "",
      entity_type: "",
      searchTerm: "",
    });
    setPage(1);
  };

  const exportLogs = async () => {
    try {
      // Fetch all logs (without pagination)
      let query = fromAuditLogs().select('*');

      // Apply filters
      if (filter.action) {
        query = query.eq("action", filter.action);
      }
      
      if (filter.entity_type) {
        query = query.eq("entity_type", filter.entity_type);
      }

      const { data: auditLogs, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Get user emails for the logs
      const userIds = Array.from(new Set(auditLogs?.map(log => log.user_id) || []));
      const userEmailsMap = new Map<string, string>();
      
      if (userIds.length > 0) {
        const { data: profiles } = await fromProfiles()
          .select('id, email')
          .in('id', userIds);
          
        profiles?.forEach(profile => {
          userEmailsMap.set(profile.id, profile.email);
        });
      }

      // Convert to CSV
      const logsWithEmail = auditLogs?.map(log => ({
        ...log,
        user_email: userEmailsMap.get(log.user_id) || 'Unknown User',
        details: JSON.stringify(log.details),
        created_at: new Date(log.created_at).toLocaleString(),
      })) || [];

      // Apply text search filtering client-side
      const filteredLogs = filter.searchTerm 
        ? logsWithEmail.filter(log => 
            log.user_email?.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
            log.details.toLowerCase().includes(filter.searchTerm.toLowerCase())
          )
        : logsWithEmail;

      const headers = ["id", "user_email", "action", "entity_type", "entity_id", "details", "ip_address", "created_at"];
      const csvRows = [
        headers.join(","),
        ...filteredLogs.map(log => 
          headers.map(header => {
            const value = log[header as keyof typeof log];
            return value ? `"${value}"` : "";
          }).join(",")
        ),
      ];

      const csvContent = csvRows.join("\n");
      
      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `audit_logs_${format(new Date(), "yyyy-MM-dd")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting logs:", error);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "create":
        return <Database className="h-4 w-4 text-green-500" />;
      case "update":
        return <FileEdit className="h-4 w-4 text-blue-500" />;
      case "delete":
        return <Trash className="h-4 w-4 text-red-500" />;
      case "predict":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "login":
      case "logout":
        return <User className="h-4 w-4 text-purple-500" />;
      default:
        return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Audit Log</CardTitle>
            <CardDescription>System activity history</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportLogs}
              className="flex items-center space-x-1"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="flex items-center space-x-2 flex-1">
            <Input
              placeholder="Search logs..."
              value={filter.searchTerm}
              onChange={(e) => setFilter({ ...filter, searchTerm: e.target.value })}
              className="max-w-sm"
            />
            <Button variant="ghost" size="icon" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select
              value={filter.action}
              onValueChange={(value) => setFilter({ ...filter, action: value })}
            >
              <SelectTrigger className="w-[120px]">
                <div className="flex items-center space-x-1">
                  <Filter className="h-4 w-4" />
                  <span>{filter.action || "Action"}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="predict">Predict</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={filter.entity_type}
              onValueChange={(value) => setFilter({ ...filter, entity_type: value })}
            >
              <SelectTrigger className="w-[120px]">
                <div className="flex items-center space-x-1">
                  <Filter className="h-4 w-4" />
                  <span>{filter.entity_type || "Entity"}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All entities</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="model">Model</SelectItem>
                <SelectItem value="prediction">Prediction</SelectItem>
                <SelectItem value="data">Data</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="ghost" size="sm" onClick={resetFilters}>Clear</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Action
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Entity
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  User
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Details
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  Date/Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="ml-2">Loading logs...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-muted-foreground">
                    No logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/50">
                    <td className="px-4 py-4 text-sm">
                      <div className="flex items-center">
                        <div className="mr-2">{getActionIcon(log.action)}</div>
                        <span className="capitalize">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm capitalize">
                      {log.entity_type}
                      {log.entity_id && (
                        <span className="text-xs text-muted-foreground ml-1">
                          #{log.entity_id.slice(0, 8)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm hidden md:table-cell">
                      {log.user_email || "System"}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {log.details?.name || log.details?.description || JSON.stringify(log.details).substring(0, 50)}
                      {JSON.stringify(log.details).length > 50 && "..."}
                    </td>
                    <td className="px-4 py-4 text-sm hidden lg:table-cell">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditLogPanel;
