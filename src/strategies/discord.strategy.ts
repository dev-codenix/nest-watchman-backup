import { DiscordBodyInterface, DiscordConfig } from '../interfaces';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Optional } from '@nestjs/common';
import { Subscription } from 'rxjs';
import { EmbedBuilder } from 'discord.js';
import { BaseStrategy } from './base.strategy';

@Injectable()
export class DiscordBaseStrategy extends BaseStrategy {
  @Inject()
  private httpService: HttpService;

  @Inject(EmbedBuilder.name)
  embedBuilder: EmbedBuilder;

  /**
   * @param discordConfig
   * @param discordConfig.webHookUrl discord webhook url
   * @param discordConfig.mentionList if you want mention some use this method. note that don't use @
   * */
  constructor(@Optional() discordConfig?: DiscordConfig) {
    super();
    if (discordConfig) this.config = discordConfig;
  }

  protected send(discordBody: DiscordBodyInterface): Subscription {
    return this.httpService
      .post(this.config.webHookUrl, discordBody)
      .subscribe();
  }

  private mention(mentionList: Array<'here' | 'everyone' | string>): string {
    return mentionList
      .map((person) =>
        person === 'here' || person === 'everyone'
          ? `@${person}`
          : `@<${person}>`,
      )
      .join(', ');
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
        {
          name: 'Trace',
          value: this.exception?.stack.slice(0, 1020) + '...',
        },
      )
      .setTimestamp()
      .setFooter({
        text: 'Happened At ',
        iconURL: 'https://i.imgur.com/AfFp7pu.png',
      });
    if (this.exception.uuid)
      embed.addFields({ name: 'Tracking Id', value: this.exception.uuid });
    const discordBody: DiscordBodyInterface = {
      embeds: [embed],
    };
    if (this.config.mentionList && this.config.mentionList.length)
      discordBody.content = this.mention(this.config.mentionList);
    return discordBody;
  }
}
