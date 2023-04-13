import {
  Allowed_Mention_Types,
  DiscordBodyInterface,
  IException,
} from '../interfaces';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { Inject } from '@nestjs/common';
import { Subscription } from 'rxjs';

export default class DiscordBaseStrategy {
  @Inject()
  httpService: HttpService;

  private _statusCode: number;
  private _exception: IException;
  private _request: Request;
  private _response: Response;
  private _filePath: string;
  private _fileName: string;
  constructor(private webHookUrl: string) {}
  execute(
    exception: IException,
    fromWatch: boolean,
    statusCode?: number,
    request?: Request,
    response?: Response,
  ): void {
    this._statusCode = statusCode || null;
    this._exception = exception || null;
    this._request = request || null;
    this._response = response || null;
    this._filePath = this.extractErrorPath(this._exception.stack);
    this._fileName =
      this._filePath && this.extractErrorFileNameFromPath(this._filePath);
    const message: string = this[`${fromWatch ? 'watch' : ''}MessageFormat`]();
    this.send(message);
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

  private send(message: string): Subscription {
    const discordBody: DiscordBodyInterface = {
      content: message,
      allowed_mentions: {
        parse: [
          Allowed_Mention_Types.UserMentions,
          Allowed_Mention_Types.RoleMentions,
          Allowed_Mention_Types.EveryoneMentions,
        ],
        // users: ['3312'],
        // replied_user: true,
      },
      embeds: [
        { color: 0xff0000, title: 'test1', type: 'rich' },
        {
          color: 0xff0000,
          title: 'test2',
          type: 'rich',
          fields: [
            { name: 'hello', value: 'world' },
            { name: 'filed2', value: 'test', inline: true },
          ],
        },
      ],
    };
    return this.httpService.post(this.webHookUrl, discordBody).subscribe();
  }
  watchMessageFormat(): string {
    const mentions = ['<@3312>'];
    return `${
      this._exception.uuid ? `[__${this._exception.uuid}__]   - ` : ''
    } ${new Date(new Date()).toLocaleString()}  ERROR [${
      this._fileName || 'ExceptionHandler'
    }] Route {${this._request.path}, ${this._request.method}}: ${
      this._exception.message
    }
    ${this._exception.stack}
    ${mentions.join(', ')}
    `;
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
}
