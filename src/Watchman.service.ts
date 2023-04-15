import { ArgumentsHost, HttpStatus, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseStrategy } from './strategies';
import { IException, WatchmanModuleOptions } from './interfaces';

@Injectable()
export class WatchmanService {
  constructor(
    private options: Partial<WatchmanModuleOptions>,
    private strategy: BaseStrategy,
  ) {}

  public setStrategy(strategy: BaseStrategy) {
    this.strategy = strategy;
  }

  public watch(
    exception: IException,
    host: ArgumentsHost,
    trackUUID?: string,
  ): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status =
      'getStatus' in exception
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    if (trackUUID) exception.uuid = trackUUID;
    if (status === HttpStatus.INTERNAL_SERVER_ERROR)
      return this.strategy.execute(exception, true, status, request, response);
    if (this.options && this.options.catchOnlyInternalExceptions) return;
    return this.strategy.execute(exception, true, status, request, response);
  }

  // TODO method for error that can't be caught from exception handler
}
