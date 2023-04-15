import { DiscordBodyInterface, DiscordConfig } from '../interfaces';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Subscription } from 'rxjs';
import { EmbedBuilder } from 'discord.js';
import { BaseStrategy } from './base.strategy';
import { ModuleRef } from '@nestjs/core';
export class DiscordBaseStrategy extends BaseStrategy {
  @Inject()
  private httpService: HttpService;

  @Inject(EmbedBuilder.name)
  embedBuilder: EmbedBuilder;

  private _mentioned: Array<string> = [];
  /**
   * @param webHookUrl discord webhook url
   * @param mentionList if you want mention some use this method. note that don't use @
   * */
  constructor(
    private webHookUrl?: string,
    private mentionList?: Array<'here' | 'everyone' | string>,
  ) {
    super();
    console.log('mentionList', mentionList);
    if (mentionList) this.mention(mentionList);
  }

  protected send(discordBody: DiscordBodyInterface): Subscription {
    console.log('httpService', this.httpService);
    console.log('config', this.config);
    return this.httpService
      .post(this.webHookUrl || this.config.webHookUrl, discordBody)
      .subscribe();
  }

  private mention(mentionList: Array<'here' | 'everyone' | string>): void {
    this._mentioned = mentionList.map((person) =>
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
    if (this._mentioned.length)
      discordBody.content = `${this._mentioned.join(', ')}`;

    return discordBody;
  }

  get instanceName(): string {
    return DiscordBaseStrategy.name;
  }
}
