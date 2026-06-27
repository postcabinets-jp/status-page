export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      pages: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          description: string | null;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          description?: string | null;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          description?: string | null;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      components: {
        Row: {
          id: string;
          page_id: string;
          name: string;
          description: string | null;
          group_name: string | null;
          status: "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance";
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          page_id: string;
          name: string;
          description?: string | null;
          group_name?: string | null;
          status?: "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance";
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          page_id?: string;
          name?: string;
          description?: string | null;
          group_name?: string | null;
          status?: "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance";
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      incidents: {
        Row: {
          id: string;
          page_id: string;
          title: string;
          status: "investigating" | "identified" | "monitoring" | "resolved";
          impact: "none" | "minor" | "major" | "critical";
          started_at: string;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          page_id: string;
          title: string;
          status?: "investigating" | "identified" | "monitoring" | "resolved";
          impact?: "none" | "minor" | "major" | "critical";
          started_at?: string;
          resolved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          page_id?: string;
          title?: string;
          status?: "investigating" | "identified" | "monitoring" | "resolved";
          impact?: "none" | "minor" | "major" | "critical";
          started_at?: string;
          resolved_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      incident_updates: {
        Row: {
          id: string;
          incident_id: string;
          status: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          incident_id: string;
          status: string;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          incident_id?: string;
          status?: string;
          message?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      incident_components: {
        Row: {
          incident_id: string;
          component_id: string;
        };
        Insert: {
          incident_id: string;
          component_id: string;
        };
        Update: {
          incident_id?: string;
          component_id?: string;
        };
        Relationships: [];
      };
      maintenances: {
        Row: {
          id: string;
          page_id: string;
          title: string;
          description: string | null;
          scheduled_start: string;
          scheduled_end: string;
          status: "scheduled" | "in_progress" | "completed";
          created_at: string;
        };
        Insert: {
          id?: string;
          page_id: string;
          title: string;
          description?: string | null;
          scheduled_start: string;
          scheduled_end: string;
          status?: "scheduled" | "in_progress" | "completed";
          created_at?: string;
        };
        Update: {
          id?: string;
          page_id?: string;
          title?: string;
          description?: string | null;
          scheduled_start?: string;
          scheduled_end?: string;
          status?: "scheduled" | "in_progress" | "completed";
          created_at?: string;
        };
        Relationships: [];
      };
      subscribers: {
        Row: {
          id: string;
          page_id: string;
          email: string;
          confirmed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          page_id: string;
          email: string;
          confirmed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          page_id?: string;
          email?: string;
          confirmed?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      uptime_records: {
        Row: {
          id: string;
          component_id: string;
          date: string;
          status: string;
          uptime_percent: number;
        };
        Insert: {
          id?: string;
          component_id: string;
          date: string;
          status: string;
          uptime_percent?: number;
        };
        Update: {
          id?: string;
          component_id?: string;
          date?: string;
          status?: string;
          uptime_percent?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      component_status: "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance";
      incident_status: "investigating" | "identified" | "monitoring" | "resolved";
      incident_impact: "none" | "minor" | "major" | "critical";
      maintenance_status: "scheduled" | "in_progress" | "completed";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
