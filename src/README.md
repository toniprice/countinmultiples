# countinmultiples

This repo contains the source code for an interactive JavaScript web tool to
practise counting in multiples.

See the
[README](https://toni.rbind.io/countinmultiples/README.md)
for some background.

## Development

Note that the following instructions apply only if you would like to
[contribute to the code](https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project#making-a-pull-request).

### Pre-requisites

[countinmuliples](https://toni.rbind.io/countinmultiples)
uses [npm](https://www.npmjs.com) for its build system. See
[Downloading and installing Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
for installation instructions.

Then use `npm` to install development dependencies:

```
$ npm install
```

This should install all dependencies from the
[lock file](https://docs.npmjs.com/cli/v10/configuring-npm/package-lock-json).

### Dependencies

[autoprefixer](https://www.npmjs.com/package/autoprefixer) \
[browser-sync](https://www.npmjs.com/package/browser-sync) \
[clean-jsdoc-theme](https://www.npmjs.com/package/clean-jsdoc-theme) \
[copyfiles](https://www.npmjs.com/package/copyfiles) \
[cssnano](https://www.npmjs.com/package/cssnano) \
[dotenv-run-script](https://www.npmjs.com/package/dotenv-run-script) \
[eslint](https://www.npmjs.com/package/eslint) \
[eslint-plugin-jsdoc](https://www.npmjs.com/package/eslint-plugin-jsdoc) \
[jsdoc](https://www.npmjs.com/package/jsdoc) \
[npm-run-all](https://www.npmjs.com/package/npm-run-all) \
[postcss-cli](https://www.npmjs.com/package/postcss-cli) \
[sass](https://www.npmjs.com/package/sass) \
[terser](https://www.npmjs.com/package/terser)

## The .env file

- In the root of your project directory, create a dotenv file (called '.env').
- Specify two environment variables:
  - `DEPLOY_PATH="</path/to/local/deployment/dir>"` [*required*] \
    The deployment path.
  - `BROWSER="<browser-for-previews>"` [*optional*] \
    E.g. `BROWSER="firefox"` \
    The browser to use for previewing the site. If `BROWSER` is not specified, or
    `BROWSER` is empty, running the `preview:*` scripts will start up a local
    server but not open a browser.

## The package.json file

Usage: \
  `npm run <script-name>` \
(runs the specified script)

Note that some scripts in `package.json` are platform dependent as they are linux
bash scripts.

## Scripts in package.json

Available scripts:

- `with-env` \
Makes variables in the dotenv file '.env' available for use within a script.

- `lint` \
Uses [eslint](https://www.npmjs.com/package/eslint) (with configuration
.eslintrc.json)  to run the linter on all .js files in src/js.

- `copy:assets` \
Copies assets (e.g. images) from src/assets/ to build/assets/.

- `copy:css` \
Copies css files from src/css/ to build/css/.

- `copy:js` \
Copies .js files which have already been minified from src/minjs/ to build/js/.

- `copy:html` \
Copies html files from src/ to build/.

- `copy:md` \
Copies markdown (.md) files from src/ to build/.

- `copy:build` \
Runs all `copy:*` scripts.

- `build.sass` \
Uses [sass](https://www.npmjs.com/package/sass) to compile sass files, with no
source map, from src/sass/ to build/css/.

- `build.js` \
Runs the linux bash script tools/minify-exploded.sh which uses
[terser](https://www.npmjs.com/package/terser) to create minified (compressed)
versions of the .js files in src/js/, saving them to src/minjs (i.e. under the
source tree).

- `build.jsdoc` \
Uses [jsdocs](https://www.npmjs.com/package/jsdoc) (with configuration
jsdoc.json) to generate documentation and save it to build/docs/.

- `dev:build` \
Note that this task is identical to `build` except that `build` also has a
pre-hook (`prebuild`). \
Executes the following steps:
  1. Runs script `clean`
  2. Runs all `build:*` scripts
  3. Runs script `copy`

- `dev:sass` \
Uses [sass](https://www.npmjs.com/package/sass) to initiate watching of sass
files in src/sass/. These get compiled (in expanded form, with a source map) to
src/css/.

- `clean` \
Deletes all files in build/.

- `prebuild` \
Pre-hook for the `build` script. Runs the linux bash script
tools/check-log-level.sh which checks that debugging is disabled prior to build
and deployment. It does this by checking if `LOGLEV` is set to anything other
than `Level.None` in .js files in src/js/.

- `build` \
Note that this task is identical to `dev:build` except that `dev:build` does not
have a pre-hook like the `build` script does. \
Executes the following steps:
  1. Runs script `clean`
  2. Runs all `build:*` scripts
  3. Runs script `copy`

- `postbuild` \
Post-hook for the `build` script. Uses
[postcss-cli](https://github.com/postcss/postcss-cli) to run
[postcss](https://postcss.org/) on files in build/css/, updating them in place
with no source map. Runs plugins:
  - [autoprefixer](https://www.npmjs.com/package/autoprefixer) to add vendor
prefixes to CSS rules using values from [Can I Use](https://caniuse.com/)
  - [cssnano](https://www.npmjs.com/package/cssnano) to compress css files

- `jsdoc:clean` \
Deletes all files in build/docs/.

- `jsdoc:refresh` \
Executes the following steps:
  1. Runs script `jsdoc:clean`
  2. Runs script `build:jsdoc`

- `deploy:clean` \
To run from the command line: `npm run with-env deploy:clean`. \
Deletes all files (except git and node_js files, including package*.json files
if they exist) in the local deployment destination. \
This script will fail if the environment variable `DEPLOY_PATH` is not set. \
Requires:
  - A dotenv file '.env' with `DEPLOY_PATH="</path/to/deployment/dir>"`
  - The dotenv file to be loaded for the deployment path.

- `deploy:copy` \
To run from the command line: `npm run with-env deploy:copy`. \
Copies site files from the build directory to the (local) deployment
directory. \
This script will fail if the environment variable `DEPLOY_PATH` is not set. \
Requires:
  - A dotenv file '.env' with `DEPLOY_PATH="</path/to/local/deployment/dir>"`
  - The dotenv file to be loaded for the deployment path.

- `deploy:build` \
To run from the command line: `npm run with-env deploy:build`. \
This script will fail if the environment variable `DEPLOY_PATH` is not set. \
Runs scripts `build`, `deploy:clean` and `deploy:copy` to build the site,
clean out any previously deployed files and copy the newly-built files to the
(local) deployment directory. \
Requires:
  - A dotenv file '.env' with `DEPLOY_PATH="</path/to/local/deployment/dir>"`
  - The dotenv file to be loaded for the deployment path.

- `deploy` \
Loads the dotenv file '.env' and runs script `deploy:build`.

- `browser:debug` \
To run from the command line: `npm run with-env browser:debug`. \
Uses [browser-sync](https://www.npmjs.com/package/browser-sync) to serve files
in src/, on port 8020. Run this script to attach to a browser (which must be
chrome or edge) from within vscode for debugging. \
Note NB: Requires:
  - The chrome/chromium or edge browser installed on the system
  - The dotenv file to be loaded for the deployment path.
  - An appropriate launch.json configuration to be specified in .vscode/launch.json,
  for example:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch chrome on localhost",
      "url": "http://localhost:8020",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

- `browser:noopen` \
Uses [browser-sync](https://www.npmjs.com/package/browser-sync) to serve files
in src/, not opening any browser for preview. After running this script,
navigate to the server's URL from within a browser of your choice.

- `browser:dev` \
To run from the command line: `npm run with-env browser:dev`. \
Uses [browser-sync](https://www.npmjs.com/package/browser-sync) to serve files
in src/, opening the browser specified in environment variable `BROWSER`. If no
valid `BROWSER` is specified, starts up a local server but does not open a
browser. This enables real-time syncing of changes during development for
viewing in a browser. \
Note NB: Requires:
  - A dotenv file '.env' with `BROWSER="<exe-for-your-choice-of-browser>"`
  - The specified browser to be installed on the system
  - The dotenv file to be loaded to open the specified browser.

- `browser:build` \
To run from the command line: `npm run with-env browser:build`. \
Uses [browser-sync](https://www.npmjs.com/package/browser-sync) to serve files
in build/, opening the browser specified in environment variable `BROWSER`. If no
valid BROWSER is specified, starts up a local server but does not open a
browser. \
Note NB: Requires:
  - A dotenv file '.env' with `BROWSER="<exe-for-your-choice-of-browser>"`
  - The specified browser to be installed on the system
  - The dotenv file to be loaded to open the specified browser.

- `debug` \
Loads the dotenv file '.env' and runs script `browser:debug`.

- `preview:dev` \
Loads the dotenv file '.env' and runs script `browser:dev`.

- `preview:build` \
Loads the dotenv file '.env' and runs script `browser:build`.
