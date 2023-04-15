import { Request, Response } from 'express';
import { Inject } from '@nestjs/common';
import { Watchman_OPTIONS } from '../constants/provider-names';
import {
  DiscordConfig,
  IException,
  WatchmanModuleOptions,
} from '../interfaces';

export abstract class BaseStrategy {
  private _statusCode: number;
  private _exception: IException;
  private _request: Request;
  private _response: Response;
  private _filePath: string;
  private _fileName: string;

  @Inject(Watchman_OPTIONS)
  private _options: WatchmanModuleOptions = {
    strategyConfig: null,
    catchOnlyInternalExceptions: false,
  };
  private strategyConfig;
  execute(
    exception: IException,
    fromWatch: boolean,
    statusCode?: number,
    request?: Request,
    response?: Response,
  ): void {
    {
      this._statusCode = statusCode || null;
      this._exception = exception || null;
      this._request = request || null;
      this._response = response || null;
      this._filePath = this.extractErrorPath(this._exception.stack);
      this._fileName =
        this._filePath && this.extractErrorFileNameFromPath(this._filePath);
      const message = this[`${fromWatch ? 'watch' : ''}MessageFormat`]();
      this.send(message);
    }
  }
  get statusCode(): number {
    return this._statusCode;
  }
  get exception(): IException {
    return this._exception;
  }
  get request(): Request {
    return this._request;
  }
  get response(): Response {
    return this._response;
  }
  get filePath(): string {
    return this._filePath;
  }
  get fileName(): string {
    return this._fileName;
  }
  get config(): DiscordConfig {
    if (!this.strategyConfig) return this._options.strategyConfig;
    return this.strategyConfig;
  }
  set config(config) {
    this.strategyConfig = config;
  }
  private extractErrorFileNameFromPath(path: string): string | null {
    return (
      path
        .slice(path.lastIndexOf('/'))
        .replace('/', '')
        .replace(/\(|\)/gi, '') || null
    );
  }
  private extractErrorPath(errorStack: string): string | null {
    errorStack = errorStack.slice(errorStack.indexOf('\n'));
    const firstIndex = errorStack.indexOf('/');
    const nextIndex = errorStack.indexOf('\n', errorStack.indexOf('/'));

    const path = errorStack.slice(firstIndex, nextIndex);
    const uselessPaths = path.match(
      /node_modules|internal|streams|stream_base_commons|task_queues/gi,
    );
    if (uselessPaths && uselessPaths.length) {
      return this.extractErrorPath(errorStack.slice(nextIndex));
    }
    return path || null;
  }
  private validateRequiredConfig() {}
  protected abstract send(messageBody): unknown;
  abstract watchMessageFormat(): unknown;
}
