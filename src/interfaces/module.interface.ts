import { ModuleMetadata, Type } from '@nestjs/common';
import { DiscordConfig } from './discord.interface';

export interface WatchmanModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  strategy?: any;
  inject?: any[];
  useClass?: Type<WatchmanModuleFactory>;
  useExisting?: Type<WatchmanModuleFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<WatchmanModuleOptions> | WatchmanModuleOptions;
}
export interface WatchmanModuleOptions {
  catchOnlyInternalExceptions?: boolean;
  strategy?: any;
  // TODO select config base on strategy type
  strategyConfig?: DiscordConfig;
}

export interface WatchmanModuleFactory {
  createWatchmanModuleOptions: () =>
    | Promise<WatchmanModuleOptions>
    | WatchmanModuleOptions;
}
