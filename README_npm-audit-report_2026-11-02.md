# npm audit report

## Security assessment

\[02nov26\]

The audit (see details below) reports 10 moderate findings associated with minimatch’s denial-of-service advisory. The dependency paths run through development tools such as `ESLint`, `copyfiles`, `npm-run-all` and `browser-sync`. The affected dependencies are development-only, and `minimatch` was not found in the built app or generated documentation bundles. Hence there is no specific need to exclude the built documentation from deployment.

The suggested `npm audit fix --force` would install ESLint 4, a breaking downgrade, so it is not an appropriate fix. Based on this assessment, updating the toolchain can be deferred to a separate maintenance change.

## Results of `npm audit`

```text
minimatch  <11.0.1
Severity: moderate
minimatch has potential denial of service via globparts amplification - https://github.com/advisories/GHSA-g3hv-75wg-m249
fix available via `npm audit fix --force`
Will install eslint@4.0.0, which is a breaking change
node_modules/@eslint/config-array/node_modules/minimatch
node_modules/eslint/node_modules/minimatch
node_modules/minimatch
  @eslint/config-array  *
  Depends on vulnerable versions of minimatch
  node_modules/@eslint/config-array
    eslint  0.7.1 - 2.0.0-rc.1 || >=4.1.0
    Depends on vulnerable versions of @eslint-community/eslint-utils
    Depends on vulnerable versions of @eslint/config-array
    Depends on vulnerable versions of minimatch
    node_modules/eslint
      @eslint-community/eslint-utils  *
      Depends on vulnerable versions of eslint
      node_modules/@eslint-community/eslint-utils
      @eslint/js  >=10.0.1
      Depends on vulnerable versions of eslint
      node_modules/@eslint/js
  copyfiles  *
  Depends on vulnerable versions of glob
  Depends on vulnerable versions of minimatch
  node_modules/copyfiles
  glob  3.0.0 - 13.0.6
  Depends on vulnerable versions of minimatch
  node_modules/glob
  npm-run-all  >=1.2.0
  Depends on vulnerable versions of minimatch
  node_modules/npm-run-all
  resp-modifier  >=1.0.0
  Depends on vulnerable versions of minimatch
  node_modules/resp-modifier
    browser-sync  >=1.7.0
    Depends on vulnerable versions of resp-modifier
    node_modules/browser-sync

10 moderate severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force
```
