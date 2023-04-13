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

  private mentioned: Array<string>;
  /**
   * @param webHookUrl discord webhook url
   * @param mentionList if you want mention some use this method. note that don't use @
   * */
  constructor(
    private webHookUrl: string,
    mentionList?: Array<'here' | 'everyone' | string>,
  ) {
    super();
    if (mentionList) this.mention(mentionList);
  }

  protected send(discordBody: DiscordBodyInterface): Subscription {
    return this.httpService.post(this.webHookUrl, discordBody).subscribe();
  }

  private mention(mentionList: Array<'here' | 'everyone' | string>): void {
    this.mentioned = mentionList.map((person) =>
      person === 'here' || person === 'everyone'
        ? `@${person}`
        : `@<${person}>`,
    );
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
    const discordBody: DiscordBodyInterface = {
      embeds: [embed],
    };
    if (this.mentioned.length)
      discordBody.content = `${this.mentioned.join(', ')}`;

    return discordBody;
  }
}
