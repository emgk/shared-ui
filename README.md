# WPMU DEV Shared UI


## Developing? Read this right after cloning this repository

1. Install node. I recommend to install `nvm` to switch between node versions.
2. Execute npm in root project folder `npm install` will install all needed packages in `node_modules` folder.
3. Execute `npm run dev` to start watching SCSS and JS files. The demo file will then automatically be served up by [Browsersync](https://browsersync.io/). All changes made will automatically be watched and the page live reloaded when changes are made.

## npm tasks
Everything should be handled by npm. Note that you don't need to interact with Gulp in a direct way.

* **`npm run dev`**: Start watching SCSS & JS files along with the demo index.html. This project uses [Browsersync](https://browsersync.io/).

## Versioning

Follow semantic versioning [http://semver.org/](http://semver.org/) as `package.json` won't work otherwise. That's it:

- `X.X.0` for major versions
- `X.X.X` for minor versions
- `X.X[.X||.0]-rc.1` for release candidates
- `X.X[.X||.0]-beta.1` for betas
- `X.X[.X||.0]-alpha.1` for alphas

# Workflow

Do not commit on `development` or `master` branches. `development` is the code that will be used for beta testing. `master` should always be synced with the latest version.

- Create a new branch from `development` branch: `git checkout -b branch-name`. Try to give it a descriptive name. For example:
    * `new/modal-box` for new features
    * `enhance/floating-notification` for enhancements
    * `fix/header-padding-incorrect` for bugfixing
- Make your commits and push the new branch: `git push -u origin branch-name`
- File the new Pull Request against `development` branch
- Assign somebody to review your code.
- Once the PR is approved and finished, merge it in `development` branch.
- Delete your branch locally and make sure that it does not longer exist remote.

It's a good idea to create the Pull Request as soon as possible so everybody knows what's going on with the project from the PRs screen in Bitbucket.
