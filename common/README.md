# Common Folder

This `common` folder should only be used for interfaces shared between the client and server, and not for application logic.

Reason:

> A service in Angular terms (client) is different from a service in the typedi/nestjs sense (server). Taking into account that each project will compile each file, we do not recommend putting logic in this folder. Constants are acceptable.
>
> A problem with putting logic in common is testing. You also need to do standalone tests, which becomes complicated.
