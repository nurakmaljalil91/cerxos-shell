# CerxosShell

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.9.

## Development server

To start a local development server, run:

```bash
npm run start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

### Permission errors when starting

If `npm run start` fails with an error like this:

```text
An unhandled exception occurred: EACCES, Permission denied: dist/cerxos-shell/browser 'dist/cerxos-shell/browser'
```

or this:

```text
An unhandled exception occurred: EACCES: permission denied, unlink '.angular/cache/.../vite/deps/@angular-architects_native-federation.js'
```

check the ownership of the generated build output and Angular cache:

```bash
ls -ld dist dist/cerxos-shell dist/cerxos-shell/browser
ls -ld .angular .angular/cache .angular/cache/*/cerxos-shell/vite/deps*
```

This can happen when generated directories were created by another user or by a container, for example as `nobody:nogroup`. Angular Native Federation and Vite remove and recreate files in these directories during startup, so the current user must own them.

Fix the ownership, then start the app again:

```bash
sudo chown -R "$USER:$USER" dist/cerxos-shell
sudo chown -R "$USER:$USER" .angular/cache
npm run start
```

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
