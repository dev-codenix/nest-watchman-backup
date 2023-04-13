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
      .setTitle(this.exception.name)
      .setFields(
        {
          name: 'Occurred In',
          value: this.fileName || 'ExceptionHandler',
        },
        {
          name: 'Route',
          value: this.request.path,
          inline: true,
        },
        {
          name: 'Http Method',
          value: this.request.method,
          inline: true,
        },
        { name: 'Trace', value: this.exception.stack },
      )
      .setTimestamp()
      .setFooter({
        text: 'Happened At ',
        iconURL: 'https://i.imgur.com/AfFp7pu.png',
      });
    if (this.exception.uuid)
      embed.addFields({ name: 'Tracking Id', value: this.exception.uuid });
    return {
      embeds: [embed],
    };
  }
}
