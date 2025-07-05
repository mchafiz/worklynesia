import { SetMetadata } from "@nestjs/common";

export interface LogOptions {
  service: string;
  action: string;
  entityType: string;
  entityId?: string | ((params: any) => string);
  metadata?: Record<string, any> | ((data: any) => Record<string, any>);
}

export const LOG_OPTIONS = "log_options";
export const Log = (options: LogOptions) => SetMetadata(LOG_OPTIONS, options);
