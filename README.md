<div align="center">
<p><img src="https://docs.nestjs.com/assets/logo-small.svg" height="152"></p>

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Conventional Changelog](https://img.shields.io/badge/changelog-conventional-brightgreen.svg)](http://conventional-changelog.github.io)
[![Standard Version](https://img.shields.io/badge/release-standard%20version-brightgreen.svg)](https://github.com/conventional-changelog/standard-version)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![airbnb-style](https://img.shields.io/badge/eslint-airbnb-4B32C3.svg)](https://github.com/airbnb/javascript)

![nest version](https://img.shields.io/github/package-json/dependency-version/miaborde/nest-new/@nestjs/core?label=nest&logo=nestjs)

[UML](./docs/uml/README.md) - [compodoc](https://miaborde.github.io/nest-new/compodoc) - [changelog](./CHANGELOG.md)

</div>

## Get corresponding frontend

If you want the full stack you can get corresponding PWA [here](https://github.com/mIaborde/ng-new).

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
# with docker only
docker-compose -f docker-compose.dev.yml --env-file .env.development up --build -V
docker-compose -f docker-compose.dev.yml --env-file .env.development up

# if you have Docker AND Node.js installed you can use short commands :
npm run docker:build
npm run docker
```

> When you add a npm package to your project you need to force your container to build.

### VSCode debugger

If you use [Visual Studio Code](https://code.visualstudio.com/) you can easily attach a Node.js debugger to this application. All settings are already done in **.vscode** folder.
Follow this [guide](https://code.visualstudio.com/docs/nodejs/nodejs-debugging) to know more.

## Run it in Production

To run your app in production mode you need to create an `.env` file (not followed by git), as a copy of `.env.development` file but with your production variables.

### Containerized

You can run this project in production mode in container, to do so you just need [Docker](https://docs.docker.com/get-docker/).

**Example 1 : Node.js container alone**

```bash
# with docker only
docker build --target production -t nest-new .
docker run --env-file ./.env -p 3333:3333 --env PORT=3333 --name nest-new nest-new
```

**Example 2 : Production environment**

```bash
# with docker only
docker-compose -f docker-compose.prod.yml --env-file .env up --scale api=4 --build -V
docker-compose -f docker-compose.prod.yml --env-file .env up --scale api=4

# if you have Docker AND Node.js installed you can use short commands :
npm run docker:build:prod
npm run docker:prod
```

## Documentation

- **API documentation:** this project use [Swagger](https://swagger.io/), the link appear when you run `npm run start` command.
- **Code documentation** this project use [Compodoc](https://compodoc.app/guides/getting-started.html) a documentation tool for Angular & Nestjs applications. It generates a static documentation of your application.
- **UML documentation** this project use [Typeorm-uml](https://github.com/eugene-manuilov/typeorm-uml) a entity relationship diagram generator for [Typeorm](https://typeorm.io/#/).
  > **Attention !**
  > Under the hood, this library uses [PlantUML](https://plantuml.com) to define diagrams and the official plantuml server to draw it. If you work on a project that has a strict security level you can't use the public server. Read the Typeorm-uml documentation to know more.

**Example :**

```bash
# api documentation: open your browser and go to doc url (change url according your conf)
open http://localhost:3000/api/doc

# code documentation: build doc website and open it
npm run doc

# uml documentation: build diagram and open it
npm run uml
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

This project respects [Semantic Versioning](https://semver.org).
To easily respect this specification a tool is provided: [Standard-version](https://github.com/conventional-changelog/standard-version).

> **Note:** commit or stash any changes before create a release.
> **Note:** Semantic versioning works differently for versions starting with `v0.x.x`. Everything before `v1.0.0` is considered experimental and breaking changes are only minor version bumps. The moment you feel comfortable you need to bump the version manually to `v1.0.0` and then the well-known versioning kicks in where breaking changes bump the major version, features bump the minor and fixes bump the patch version.

**Example :**

```bash
# add your changes
git add .

# release first version of the project (v0.0.0)
npm run release -- --first-release
# OR
# release first stable version of the project (v1.0.0)
npm run release -- --release-as 1.0.0
# OR
# perform a prerelease
npm run release:prerelease
# OR
# perform a release
npm run release

# push your changes, WITH version tags
git push --follow-tags
```

> **When you perform a release you automatically perform the following actions :**
>
> - increment version number in **package.json** (uses the `fix:` and `feat:` tags to establish the semantic versioning)
> - add a [Git tag](https://git-scm.com/book/en/v2/Git-Basics-Tagging)
> - build [Documentation](#documentation) in **./docs** folder
> - create/update [CHANGELOG.md](./CHANGELOG.md)
> - commit all staged changes with correct commit message

## Deploy it

> By default the ORM synchronizes your models with the database, which avoids migration. This is very dangerous in production as this can result in data loss. So when you deploy a production version for the first time it is advisable to disable this option.
>
> **Example :** in your `src/ormconfig.ts`
>
> ```typescript
> const connectionOptions: ConnectionOptions = {
>   ...
>   // must be set to false once the first release deployed.
>   synchronize: false,
>   ...
> };
> ```

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
