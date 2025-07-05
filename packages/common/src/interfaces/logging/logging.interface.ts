export interface LogEvent {
  service: string;
  action: string;
  entityType: string;
  entityId?: string;
  userId?: string;
  metadata?: Record<string, any>;
  status: 'success' | 'error';
  message: string;
}
