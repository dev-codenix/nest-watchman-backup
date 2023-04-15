import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { WatchmanService } from './Watchman.service';
import {
  WatchmanModuleAsyncOptions,
  WatchmanModuleFactory,
  WatchmanModuleOptions,
} from './interfaces';
import { STRATEGY_TOKEN, Watchman_OPTIONS } from './constants';
import {
  injectStrategies,
  strategyDependenciesProviders,
  strategyProviders,
  BaseStrategy,
} from './strategies';
// TODO able to inject custom strategy in
@Module({})
export class WatchmanModule {
  //TODO: fix forRoot method in config.strategy

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
        ...args: BaseStrategy[]
      ) => {
        const strategy = options.strategy || config.strategy;
        if (!strategy) throw new Error('Please Provide Strategy class');
        const loadedStrategy = args.find(
          (injectedStrategy) =>
            injectedStrategy && injectedStrategy instanceof strategy,
        );
        if (!options.strategy) {
          if (!config.strategyConfig)
            throw new Error('Please set your config in strategyConfig object');
        }

        return new WatchmanService(config, loadedStrategy);
      },
      inject: [
        { token: Watchman_OPTIONS, optional: true },
        { token: STRATEGY_TOKEN, optional: true },
        ...injectStrategies,
      ],
    };

    return {
      module: WatchmanModule,
      imports: [...(options.imports || []), HttpModule],
      providers: [
        ...this.createAsyncProviders(options),
        provider,
        ...strategyProviders,
        ...strategyDependenciesProviders,
        {
          provide: STRATEGY_TOKEN,
          useClass: options.strategy,
        },
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
    if (useClass)
      return [
        this.createAsyncOptionsProvider(options),
        {
          provide: useClass,
          useClass,
        },
      ];

    return [
      {
        provide: Watchman_OPTIONS,
        useValue: null,
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
