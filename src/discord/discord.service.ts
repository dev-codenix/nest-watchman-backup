import {
  BaseServiceInterface,
  DiscordBodyInterface,
  PostBodyDataInterface,
} from '../interfaces';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class DiscordService implements BaseServiceInterface {
  constructor(private readonly http: HttpService) {}
  // private extractErrorPath(errorStack):string {
  //   const firstIndex = errorStack.indexOf('/');
  //   const nextIndex = errorStack.indexOf('\n', errorStack.indexOf('/'));
  //   const path = errorStack.slice(firstIndex, nextIndex);
  //   const uselessPaths = path.match(
  //       /node_modules|internal|streams|stream_base_commons|task_queues/gi
  //   );
  //   if (uselessPaths && uselessPaths.length) {
  //     return this.extractErrorPath(errorStack.slice(nextIndex));
  //   }
  //   return path;
  // }
  post(url: string, data: PostBodyDataInterface): Observable<AxiosResponse> {
    // let path=this.extractErrorPath(exception.stack)
    // if (path)
    //   path=path
    //     .slice(path.lastIndexOf('/'))
    //     .replace('/', '')
    //     .replace(/\(|\)/gi, '');
    return this.http.post(url, {
      content: `${new Date(new Date()).toLocaleString()}
    [${data.uuid ? `__${data.uuid}__ |` : ''} ${data.path} ]
    ${data.message}
    ${data.stack}`,
    } as DiscordBodyInterface);
  }
}
