import { DiscordBodyInterface } from '../interfaces';
import { HttpService } from '@nestjs/axios';
import { Inject } from '@nestjs/common';
import { Subscription } from 'rxjs';
import { EmbedBuilder } from 'discord.js';
import { BaseStrategy } from './base.strategy';

export class DiscordBaseStrategy extends BaseStrategy {
  @Inject()
  private httpService: HttpService;

  @Inject()
  embedBuilder: EmbedBuilder;

  constructor(private webHookUrl: string) {
    super();
  }

  protected send(discordBody: DiscordBodyInterface): Subscription {
    return this.httpService.post(this.webHookUrl, discordBody).subscribe();
  }

  watchMessageFormat(): DiscordBodyInterface {
    /**
     * @see {@link https://discordjs.guide/popular-topics/embeds.html#embed-preview}
     * **/
    const embed = this.embedBuilder
      .setColor(0xff0000)
      .setTitle('test2')
      .setFields(
        { name: 'hello', value: 'world' },
        { name: 'filed2', value: 'test', inline: true },
      );
    const mentions = ['<@3312>'];
    const content = `${
      this.exception.uuid ? `[__${this.exception.uuid}__]   - ` : ''
    } ${new Date(new Date()).toLocaleString()}  ERROR [${
      this.fileName || 'ExceptionHandler'
    }] Route {${this.request.path}, ${this.request.method}}: ${
      this.exception.message
    }
    ${this.exception.stack}
    ${mentions.join(', ')}
    `;
    return {
      content,
      embeds: [embed],
    };
  }
}
