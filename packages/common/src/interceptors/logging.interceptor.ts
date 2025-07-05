import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, throwError } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { LOG_OPTIONS, LogOptions } from "../decorators/log.decorator";
import { LogEvent } from "../interfaces/logging/logging.interface";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly kafkaClient: any // This will be injected by each service
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const logOptions = this.reflector.get<LogOptions>(
      LOG_OPTIONS,
      context.getHandler()
    );

    if (!logOptions) {
      return next.handle();
    }

    const rpcData = context.switchToRpc().getData();
    const userId = rpcData?.user?.id;

    return next.handle().pipe(
      tap((data) => {
        const entityId =
          typeof logOptions.entityId === "function"
            ? logOptions.entityId(rpcData)
            : logOptions.entityId;

        const metadata =
          typeof logOptions.metadata === "function"
            ? logOptions.metadata(data)
            : logOptions.metadata;

        const event: LogEvent = {
          service: logOptions.service,
          action: logOptions.action,
          entityType: logOptions.entityType,
          entityId,
          userId,
          metadata,
          status: "success",
          message: `${logOptions.action} completed successfully`,
        };

        try {
          this.kafkaClient.emit("log.event", event);
        } catch (err) {
          this.logger.error(
            "Failed to emit log event",
            err instanceof Error ? err.message : String(err)
          );
        }
      }),
      catchError((error) => {
        const entityId =
          typeof logOptions.entityId === "function"
            ? logOptions.entityId(rpcData)
            : logOptions.entityId;

        const event: LogEvent = {
          service: logOptions.service,
          action: logOptions.action,
          entityType: logOptions.entityType,
          entityId,
          userId,
          metadata: logOptions.metadata,
          status: "error",
          message: error.message,
        };

        try {
          this.kafkaClient.emit("log.event", event);
        } catch (err) {
          this.logger.error(
            "Failed to emit log event",
            err instanceof Error ? err.message : String(err)
          );
        }

        return throwError(() => error);
      })
    );
  }
}
