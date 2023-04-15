<!--
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>

[//]: # (<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>)
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  [![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

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
