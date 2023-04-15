import {
  InjectionToken,
  OptionalFactoryDependency,
  Provider,
} from '@nestjs/common';
import { DiscordBaseStrategy } from './discord.strategy';
import { BaseStrategy } from './base.strategy';
import { EmbedBuilder } from 'discord.js';
import { HttpService } from '@nestjs/axios';
// export from here to access locally
export { DiscordBaseStrategy, BaseStrategy };
export const injectStrategies: Array<
  InjectionToken | OptionalFactoryDependency
> = [DiscordBaseStrategy.name];
export const strategyProviders: Array<Provider<any>> = [
  {
    provide: DiscordBaseStrategy.name,
    useClass: DiscordBaseStrategy,
    inject: [EmbedBuilder.name, HttpService],
  },
];

export const strategyDependenciesProviders: Array<Provider<any>> = [
  {
    provide: EmbedBuilder.name,
    useClass: EmbedBuilder,
  },
];
