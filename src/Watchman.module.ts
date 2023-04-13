import { DiscordService } from './discord/discord.service';
import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import { DiscordModule } from './discord/discord.module';
import { WatchmanService } from './Watchman.service';
import {
  WatchmanModuleAsyncOptions,
  WatchmanModuleFactory,
  WatchmanModuleOptions,
  WatchmanOptionsInterface,
} from './interfaces';
import { Watchman_OPTIONS, WATCHMAN_TOKEN } from './constants';
import { ModuleRef } from '@nestjs/core';
import { BaseStrategy } from './strategies/base.strategy';
import { EmbedBuilder } from 'discord.js';

// const WatchmanServiceFactory = (
//   option: Partial<WatchmanOptionsInterface>,
// ): Provider<any> => {
//   return {
//     provide: WatchmanService,
//     useFactory: () => {
//       return new WatchmanService(option);
//     },
//     inject: [DiscordService],
//   };
// };
@Module({})
export class WatchmanModule {
  // static forRoot(option: WatchmanModuleOptions): DynamicModule {
  //   option.catchOnlyInternalExceptions = false;
  //   const providers: Provider<any>[] = [
  //     {
  //       provide: WatchmanService,
  //       useFactory: () => {
  //         return new WatchmanService(option, option.strategy);
  //       },
  //       inject: [DiscordService],
  //     },
  //   ];
  //   return {
  //     providers: providers,
  //     exports: providers,
  //     module: WatchmanModule,
  //     // imports: [HttpModule],
  //   };
  // }
  static forRootAsync(options: WatchmanModuleAsyncOptions): DynamicModule {
    const provider: Provider = {
      provide: WatchmanService,
      useFactory: async (
        config: WatchmanModuleOptions,
        strategy: BaseStrategy,
      ) => {
        if (!strategy && !config.webHookStrategy)
          throw new Error('Please Provide Strategy');
        return new WatchmanService(config, strategy || config.webHookStrategy);
      },
      inject: [Watchman_OPTIONS, options.strategy as any],
    };
    return {
      module: WatchmanModule,
      imports: [...(options.imports || []), HttpModule],
      providers: [
        ...this.createAsyncProviders(options),
        provider,
        options.strategy as any,
        BaseStrategy,
        EmbedBuilder,
      ],
      exports: [provider],
    };
  }
  private static createAsyncProviders(
    options: WatchmanModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    const useClass = options.useClass as Type<WatchmanModuleFactory>;

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }
  private static createAsyncOptionsProvider(
    options: WatchmanModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: Watchman_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const inject = [
      (options.useClass || options.useExisting) as Type<WatchmanModuleFactory>,
    ];

    return {
      provide: Watchman_OPTIONS,
      useFactory: async (optionsFactory: WatchmanModuleFactory) =>
        await optionsFactory.createWatchmanModuleOptions(),
      inject,
    };
  }
}
