# countinmultiples

Count along to your multiple of choice!

A little tool to practise counting in multiples. I originally created this
whilst volunteering with a primary school&#8217;s &#8220;Maths Mountain&#8221;
program which aims to help children become more secure in
![times tables](https://www.bbc.co.uk/bitesize/search?q=times+tables)
and
![number bonds](https://www.bbc.co.uk/bitesize/search?q=number+bonds)
<br>
I wrote the code in vanilla JavaScript as a personal learning exercise and more
recently updated it for
![ECMAScript 6](https://www.codecademy.com/article/javascript-versions)
<br>
It is &#8216;vanilla&#8217; in the sense of plain, i.e. with no dependence on
JavaScript frameworks.

## Development

### Dev dependencies

[autoprefixer](https://www.npmjs.com/package/autoprefixer)
[browser-sync](https://www.npmjs.com/package/browser-sync)
[clean-jsdoc-theme](https://www.npmjs.com/package/clean-jsdoc-theme)
[copyfiles](https://www.npmjs.com/package/copyfiles)
[cssnano](https://www.npmjs.com/package/cssnano)
[dotenv-run-script](https://www.npmjs.com/package/dotenv-run-script)
[eslint](https://www.npmjs.com/package/eslint)
[eslint-config-google](https://www.npmjs.com/package/eslint-config-google)
[eslint-plugin-jsdoc](https://www.npmjs.com/package/eslint-plugin-jsdoc)
[jsdoc](https://www.npmjs.com/package/jsdoc)
[npm-run-all](https://www.npmjs.com/package/npm-run-all)
[postcss-cli](https://www.npmjs.com/package/postcss-cli)
[sass](https://www.npmjs.com/package/sass)
[terser](https://www.npmjs.com/package/terser)

### Dev Installation

```json
$ npm install \
autoprefixer \
browser-sync \
clean-jsdoc-theme \
copyfiles \
cssnano \
dotenv-run-script \
eslint \
eslint-config-google \
eslint-plugin-jsdoc \
jsdoc \
npm-run-all \
postcss-cli \
sass \
terser \
--save-dev
```

## The `.env` file

- In the root of your project directory, create a dotenv file called ".env".
- Specify two environment variables:
  - DEPLOY_PATH="/path/to/local/deployment/directory" [required]
  - BROWSER="<browser-for-previews>" [optional], <br>
    E.g. BROWSER="firefox" <br>
    The browser to use for previewing the site. If no BROWSER is specified, or
    BROWSER is empty, running the `preview:*` scripts will start up a local
    server but not open a browser.

## The `package.json` file

Note that some scripts in package.json are platform dependent as they are linux
bash scripts.

prebuild:    Runs bash script check-debug-settings.sh
build:js:    Runs bash script minify-exploded.sh
serve:build: Uses an environment variable which is set via the linux shell

## Scripts in `package.json`

Usage:
  `npm run <script-name>` - Runs the specified script

Available scripts:

with-env
: Loads the dotenv file '.env' to use its variables with a script.

lint
: Uses [eslint](https://www.npmjs.com/package/eslint) (with configuration
.eslintrc.json)  to run the linter on all .js files in src/js.

copy:assets
: Copies assets (e.g. images) from src/assets/ to build/assets/.

copy:css
: Copies css files from src/css/ to build/css/.

copy:js
: Copies .js files which have already been minified from src/minjs/ to build/js/.

copy:html
: Copies html files from src/ to build/.

copy:md
: Copies markdown (.md) files from src/ to build/.

copy:build
: Runs all 'copy:*' scripts.

build.sass
: Uses [sass](https://www.npmjs.com/package/sass) to compile sass files, with no
source map, from src/sass/ to build/css/.

build.js
: Runs the linux bash script tools/minify-exploded.sh which uses
[terser](https://www.npmjs.com/package/terser) to create minified (compressed)
versions of the .js files in src/js/, saving them to src/minjs (i.e. under the
source tree).

build.jsdoc
: Uses [jsdocs](https://www.npmjs.com/package/jsdoc) (with configuration
jsdoc.json) to generate documentation and save it to build/docs/.

dev:build
: Executes the following steps:
- Runs script 'clean'
- Runs all 'build:*' scripts
- Runs script 'copy'
Note that this task is identical to 'build' except that 'build' also has a
pre-hook ('prebuild').

dev:sass
: Uses [sass](https://www.npmjs.com/package/sass) to initiate watching of sass
files in src/sass/. These get compiled (in expanded form, with a source map) to
src/css/.

clean
: Deletes all files in build/.

prebuild:
: Pre-hook for the 'build' script. Runs the linux bash script
tools/check-debug-settings.sh which checks that debugging is disabled prior to
build and deployment. It does this by detecting occurrences of the strings
'DEBUG = true' and or 'VDBG = true' in .js files in src/js/.

build
: Executes the following steps:
- Runs script 'clean'
- Runs all 'build:*' scripts
- Runs script 'copy'
Note that this task is identical to 'dev:build' except that 'dev:build' does not
have a pre-hook as the 'build' script does.

postbuild
: Post-hook for the 'build' script. Uses
[postcss-cli](https://github.com/postcss/postcss-cli) to run
[postcss](https://postcss.org/) on files in build/css/, updating them in place
with no source map. Runs plugins:
- [autoprefixer](https://www.npmjs.com/package/autoprefixer) to add vendor
prefixes to CSS rules using values from [Can I Use](https://caniuse.com/)
- [cssnano](https://www.npmjs.com/package/cssnano) to compress css files

jsdoc:clean
: Deletes all files in build/docs/.

jsdoc:refresh
: Executes the following steps:
- Runs script 'jsdoc:clean'
- Runs script 'build:jsdoc'

deploy:clean
: Deletes all files (except git and node_js files, including package*.json files
if they exist) in the local deployment destination. <br>
Note NB: Requires:
- A dotenv file '.env' with DEPLOY_PATH="</path/to/deployment/dir>"
- The dotenv file to be loaded for the deployment path. <br>
This script will fail if the environment variable DEPLOY_PATH is not set. <br>
To run from the command line: 'npm run with-env deploy:clean'

deploy:copy
: Copies site files from the build directory to the (local) deployment
directory. <br>
Note NB: Requires:
- A dotenv file '.env' with DEPLOY_PATH="</path/to/local/deployment/dir>"
- The dotenv file to be loaded for the deployment path. <br>
This script will fail if the environment variable DEPLOY_PATH is not set. <br>
To run from the command line: 'npm run with-env deploy:copy'

deploy:build
: Runs scripts 'build', 'deploy:clean' and 'deploy:copy' to build the site,
clean out any previously deployed files and copy the newly-built files to the
(local) deployment directory. <br>
Note NB: Requires:
- A dotenv file '.env' with DEPLOY_PATH="</path/to/local/deployment/dir>"
- The dotenv file to be loaded for the deployment path. <br>
This script will fail if the environment variable DEPLOY_PATH is not set. <br>
To run from the command line: 'npm run with-env deploy:build'

deploy
: Loads the dotenv file '.env' and runs script 'deploy:build'.

browser:debug
: Uses [browser-sync](https://www.npmjs.com/package/browser-sync) to serve files
in src/, on port 8020. Run this script to attach to a browser (which must be
chrome or edge) from within vscode for debugging. <br>
Note NB: Requires:
- The chrome/chromium or edge browser installed on the system
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
- The dotenv file to be loaded for the deployment path. <br>
To run from the command line: 'npm run with-env browser:debug'

browser:noopen
: Uses [browser-sync](https://www.npmjs.com/package/browser-sync) to serve files
in src/, not opening any browser for preview. After running this script,
navigate to the server's URL from within a browser of your choice.

browser:dev
: Uses [browser-sync](https://www.npmjs.com/package/browser-sync) to serve files
in src/, opening the browser specified in environment variable BROWSER. If no
valid BROWSER is specified, starts up a local server but does not open a
browser. This enables real-time syncing of changes during development for
viewing in a browser. <br>
Note NB: Requires:
- A dotenv file '.env' with BROWSER="<exe-for-your-choice-of-browser>"
- The specified browser to be installed on the system
- The dotenv file to be loaded to open the specified browser. <br>
To run from the command line: 'npm run with-env browser:dev'

browser:build
: Uses [browser-sync](https://www.npmjs.com/package/browser-sync) to serve files
in build/, opening the browser specified in environment variable BROWSER. If no
valid BROWSER is specified, starts up a local server but does not open a
browser. <br>
Note NB: Requires:
- A dotenv file '.env' with BROWSER="<exe-for-your-choice-of-browser>"
- The specified browser to be installed on the system
- The dotenv file to be loaded to open the specified browser. <br>
To run from the command line: 'npm run with-env browser:build'

debug
: Loads the dotenv file '.env' and runs script 'browser:debug'.

preview:dev
: Loads the dotenv file '.env' and runs script 'browser:dev'.

preview:build
: Loads the dotenv file '.env' and runs script 'browser:build'.
