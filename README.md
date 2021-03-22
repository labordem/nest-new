<div align="center">
<p><img src="https://docs.nestjs.com/assets/logo-small.svg" height="152"></p>

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Conventional Changelog](https://img.shields.io/badge/changelog-conventional-brightgreen.svg)](http://conventional-changelog.github.io)
[![Standard Version](https://img.shields.io/badge/release-standard%20version-brightgreen.svg)](https://github.com/conventional-changelog/standard-version)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![airbnb-style](https://img.shields.io/badge/eslint-airbnb-4B32C3.svg)](https://github.com/airbnb/javascript)

![nest version](https://img.shields.io/github/package-json/dependency-version/miaborde/nest-new/@nestjs/core?label=nest&logo=nestjs)

[changelog](./CHANGELOG.md)

</div>

## Run it in Development

### Local Node.js

You can run this project in watch/debug mode in local dev environment, to do so you need [Node.js](https://nodejs.org), and if you do not have [Docker](https://docs.docker.com/get-docker/) installed on your machine, you must create the [Postgres](https://www.postgresql.org/) database yourself and configure `.env.development` file according to it.

**Example :**

```bash
# if you want a containerized database
npm run docker:db

# and in all cases :

# install dependencies
npm i
# run in development mode
npm run start
```

### Containerized

You can run this project in watch/debug mode in fully containerized environment, to do so you just need [Docker](https://docs.docker.com/get-docker/) (for linux users you also need [Docker-compose](https://docs.docker.com/compose/install/)).

**Example :**

```bash
docker-compose --env-file .env.development up
# or if you have Docker AND Node.js installed you can use short command :
npm run docker
```

When you add a npm package to your project you need to force your container to fully build.

**Example :**

```bash
docker-compose --env-file .env.development up --build -V
# or if you have Docker AND Node.js installed you can use short command :
npm run docker:build
```

### VSCode debugger

If you use [Visual Studio Code](https://code.visualstudio.com/) you can easily attach a Node.js debugger to this application. All settings are already done in **.vscode** folder.
Follow this [guide](https://code.visualstudio.com/docs/nodejs/nodejs-debugging) to know more.

## Run it in Production

To run your app in production mode you need to create an `.env` file (not followed by git), as a copy of `.env.development` file but with your production variables.

### Containerized

You can run this project in production mode in container, to do so you just need [Docker](https://docs.docker.com/get-docker/).

**Example :**

```bash
# with docker only
docker build --target production -t nest-new .
docker run --env-file ./.env -p 3333:3333 --env PORT=3333 --name nest-new nest-new

# if you have Docker AND Node.js installed you can use short commands :
npm run docker:build:prod
npm run docker:prod
```

## Documentation

- **API documentation:** this project use [Swagger](https://swagger.io/), the link appear when you run `npm run start` command.
- **Code documentation** this project use [Compodoc](https://compodoc.app/guides/getting-started.html) a documentation tool for Angular & Nestjs applications. It generates a static documentation of your application.

**Example :**

```bash
# api documentation: open your browser and go to doc url (change url according your conf)
open http://localhost:3000/api/doc

# code documentation: build doc website and open it
npm run doc
```

## Git flow

This project respects [Conventional commits](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit), a Git commit convention made by the Angular team. Basically, every pull request should end up with one commit and a standardized commit message.

To easily respect this a tool is provided: [Commitizen](https://github.com/commitizen/cz-cli) called with `npm run cz` command, you are not obligated to use it, if you make your commits manually they will be tested too.

> **Attention !**
> Do not commit without a **node_modules** folder at the root of the project (run `npm i` command to get it), otherwise your commit and your code will not trigger `lint` / `format` / `cz` scripts.

**Example :**

```bash
# add your changes
git add .
# commit with commitizen-cli
npm run cz
# push changes
git push

# if your commit fail you can perform changes and retry with previous message
npm run cz -- --retry
```

## Database operations

### Postgres CLI

[psql](https://www.postgresql.org/docs/13/app-psql.html) is a terminal-based front-end to PostgreSQL. It enables you to type in queries interactively, issue them to PostgreSQL, and see the query results.

**Example :**

```bash
# run psql in db container
npm run docker:db:psql
```

### Migrations

Migrations provide a way to incrementally update the database schema to keep it in sync with the application's data model while preserving existing data in the database. To generate, run, and revert migrations, TypeORM provides a dedicated CLI.

**Example :**

```bash
# generate a migration
npm run migration:generate <MigrationClassNameInPascalCase>
# run a migration
npm run migration
```

## Create a release

This project respect [Semantic Versioning](https://semver.org).
To easily respect this specification a tool is provided: [Standard-version](https://github.com/conventional-changelog/standard-version).

> **Note:** commit or stash any changes before create a release.

**Example :**

```bash
# add your changes
git add .

# perform release modifications, and commit all staged changes
npm run release
# OR
npm run release:alpha

# push your changes, keep version tag
git push --follow-tags
```

> **When you perform a release you automatically perform the following actions :**
>
> - increment version number in package.json (uses the `fix:` and `feat:` tags to establish the semantic versioning)
> - add a git tag
> - update **CHANGELOG.md**

## Deploy it

### Heroku

- Create an app on [Heroku](https://dashboard.heroku.com/apps)
- Set Heroku config vars equals to your production `.env` file
- create a Procfile, that specifies the commands that are executed by the app on startup : `echo 'web: NODE_ENV=production node dist/src/main' >> Procfile`
- Follow Heroku instructions to deploy with git

## Make it yours

- Clone this project and move into it
- Reset git history : `rm -rf .git && git init`
- Run `npm ci` after reset git history (important for pre-commit hooks)
- Replace ALL `nest-new` occurrence with your project name
- Replace ALL `miaborde` occurrence with your Github username
- You're good to go :)
