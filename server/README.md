# NestJS Server

This project is an implementation of the starting server using the [NestJS](https://nestjs.com/) framework. This is an alternative to the basic server provided that uses NodeJS/Express. You can use either the provided NodeJS/Express server or this server for your project.

## NestJS

NestJS is a framework for developing dynamic servers using NodeJS and Express with an architecture very similar to Angular. You will notice the use of terms such as `service`, `module`, and others similar to Angular.

NestJS uses decorators (annotations with the `@` symbol) to attach additional functionality to the code. For example, configuring a route handler in NestJS:

```ts
@Get('/')
dateInfo(): Message {
    return {
        body: this.dateService.currentTime(),
    };
}
```

is equivalent to the following configuration with Express:

```ts
this.router.get('/', (req: Request, res: Response) => {
    this.dateService.currentTime().then((time: Message) => {
        res.json(time);
    });
});
```

## Integration with Course Examples

To help you, this project also includes the necessary code to present communication features with a `MongoDB` database and communication with `SocketIO`. The code is based on the following projects available on GitLab:

-   [`MongoDB`](https://gitlab.com/nikolayradoev/mongodb-example): the `/api/docs` route of the NodeJS server offers an interface that allows you to test the connection with the database. Note that NestJS uses the `Mongoose` library for communication with MongoDB.

    **Important**: you must configure the `DATABASE_CONNECTION_STRING` environment variable available in the `.env` file before you can connect to a database.

-   [`SocketIO`](https://gitlab.com/nikolayradoev/socket-io-exemple): you can use the website (client) from this example to test WebSocket communication with the NestJS server. Note that this example assumes the server is available on port `5000`: you must modify the URI of your requests.

NestJS uses the `Jest` library for its tests. All the provided code is already tested with several unit test examples. You can base your own feature tests on these examples.

# Server Choice

You must choose the server to use in your project: basic NodeJS/Express or NestJS. In both cases, you must make some changes to your repository.

Note that the configurations for deployment and the validation pipeline assume there is only one `/server` directory in your repository. Regardless of your choice, your server directory must have this name.

### Basic NodeJS Server

If you have decided to keep the basic NodeJS server, you only need to delete the `/server-nestjs` directory and push your changes to Git.

**Note: it is important to remove the unused server directory to avoid having _dead code_ that is never used in your repository.**

### NestJS Server

If you have decided to use the NestJS server, you must:

- Delete the `/server` directory and rename `/server-nestjs` to `/server`.
- Modify the `entryFile` field value to `server/app/index` in the `nest-cli.json` file.
- Modify the `@app` field value to `out/server/app` in the `/server/package.json` file.

Don't forget to push your changes to Git.

**Note: it is important to remove the unused server directory to avoid having _dead code_ that is never used in your repository.**

### NestJS Server without Database

If you want to start with the NestJS server without a configured MongoDB instance connection, you must modify the [app.module.ts](./app/app.module.ts) file and remove references to `MongooseModule`, `CourseController`, and `CourseService`. Your configuration should be as follows:

```ts
@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true })
    ],
    controllers: [DateController, ExampleController],
    providers: [ChatGateway, DateService, ExampleService, Logger],
})
export class AppModule {}
```

**Note: the use of MongoDB will eventually be required in the project. It is recommended to simply comment out the `MongooseModule` configuration and remove the example controller and service. When you need the database, you can simply reactivate the configuration.**