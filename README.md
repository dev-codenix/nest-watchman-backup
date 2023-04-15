
## Description

[Watchman](https://github.com/nestjs/nest) is an error cather for Nest framework.

## Installation

```bash
$ npm install @devcodenix/nest-watchman
```

## Module Configuration
### Main config properties
- `strategy`
    - you can use the [ base strategies ](https://github.com/nestjs/nest) that provided by us, it has default message structure, and you don't have to do anything about it, or you can use a [custom strategy](https://github.com/nestjs/nest)
- `catchOnlyInternalExceptions`
    - if you pass `true` Watchman will catch only the internal server errors. `default=false`
- `strategyConfig`
    - it will change base on your strategy
### forRoot Config
```ts
// app.module.ts
@Module({
  imports: [
    WatchmanModule.forRoot({
          strategy: DiscordBaseStrategy,
          catchOnlyInternalExceptions: true,
          strategyConfig: {
            webHookUrl: 'https://discord.com/api/webhooks/id/token',
            mentionList: ['everyone'],
          },
    }),
  ],
})
```
### Async Config
#### Using `useFactory` method
```ts
// app.module.ts
@Module({
  imports: [
    WatchmanModule.forRootAsync({
      imports:[AppConfigModule],
      useFactory: (configService: AppConfigService) => {
        return {
          strategy: DiscordBaseStrategy,
          catchOnlyInternalExceptions: true,
          strategyConfig: {
            webHookUrl: configService.WATCHMAN_WEBHOOK,
            mentionList: ['everyone'],
          },
        };
      },
      inject: [AppConfigService],
    }),
  ],
})
```
#### Using `useClass` method
```ts
// app.module.ts
@Module({
  imports: [
    WatchmanModule.forRootAsync({
      imports:[AppConfigModule],
      useClass: AppConfigService
    }),
  ],
})
```
you can pass your config in `createWatchmanModuleOptions()` 

## Strategies
### Discord
these are the configs that you should pass in `strategyConfig` property or in custom strategy's constructor 
```ts
{
  webHookUrl: configService.WATCHMAN_WEBHOOK,
  mentionList: ['everyone']
}
```
- `webHookUrl`
  - discord web hook url. you can find it [here](google.com)
- `mentionList` 
  - list of persons that you want to mention in the discord channel. note that don't use @ in the mentions. example `here, everyone` 
## Custom Strategy
```ts
// discord.strategy.ts
@Injectable()
export class DiscordStrategy extends DiscordBaseStrategy {
  constructor(private configService: AppConfigService) {
    super({
      webHookUrl: configService.WATCHMAN_WEBHOOK,
      mentionList: ["here"]
    });
  }
  watchMessageFormat(): IDiscordBody {
    return super.watchMessageFormat();
  }
}
```
## Stay in touch

- Author - [Em Daneshjoo](https://kamilmysliwiec.com)
- Author - [Ali Zali](https://kamilmysliwiec.com)

## License

Watchman is [MIT licensed](LICENSE).
