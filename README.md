# Creating a UI Components lib for ReactJs projects.

## Opiniated choices

There are many ways to create a UI Components lib, so some choices have to be made. I tried to choose recent and common tools that can be used in a professional / production ready project.

We will use :
- vite + rolldown
- scss modules to style components
- eslint (still far more tests than with Biome)
- prettier
- vitest + React Testing library for unit testing
- Storybook to demonstrate the components
- 'use client' directive so our client side components will be easily usable in a NextJs project
- use exact versions of our dependencies, and use npm-check-updates to easily update versions

## Creating the project

### Boostraping

Using vite is the simpliest way to bootstrap the project. Some questions are asked to create the project.
- choose a **name** for your UI Component library.
- of course we will use **react**
- I chose the **Typescript + SWC** variant, using **Typescript + React Compiler** is harder to configure, especially when importing the lib in another project
- **Rolldown** works well and is more futur proof

```console
➜  dev npm create vite@latest
Need to install the following packages:
create-vite@8.2.0
Ok to proceed? (y) y

> npx
> "create-vite"

│
◇  Project name:
│  new-ui-components-lib
│
◇  Select a framework:
│  React
│
◇  Select a variant:
│  TypeScript + SWC
│
◇  Use rolldown-vite (Experimental)?:
│  Yes
│
◇  Install with npm and start now?
│  Yes
│
◇  Scaffolding project in /Users/jbcazaux/dev/new-ui-components-lib...
│
◇  Installing dependencies with npm...

added 233 packages, and audited 234 packages in 7s

62 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
│
◇  Starting dev server...
```

### Removing useless default sample files

You can remove the content of the _src_ folder. It is just a sample App that we wont use, since we are creating a library.
```console
➜  rm -Rf src/*
```
You will create a _README.md_ if you want, just delete the file for now. The _index.html_ was used for the app, we can delete it safely.
```console
➜  rm README.md index.html
```

No need to the _public_ directory either.
```console
➜  rm -Rf public
```

There are 3 tsconfig*.json files. We will use the tsconfig.node.json for the build tasks and renaming _tsconfig.app.json_ to _tsconfig.lib.json_ for the configuration regarding the library files.
```console
➜  mv tsconfig.app.json tsconfig.lib.json
```
Do not forget to reflect the renaming of the file in your tsconfig.json
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.lib.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

## Our first UI Components

As an example for this library we will create two simple components. It will be a Button and a Text components. In real life you may want to base your components on an headless component lib like shadcn, radix-ui, react-aria, ...

### Before we start

#### Install dependencies

We will use the **classnames** library to easily manage conditional css styling.
```console
➜  npm i classnames -S -E
````

We have to support scss modules so there are some dependencies to install
```console
➜  npm i -D -E sass-embedded vite-plugin-lib-inject-css glob
````

#### Design Tokens

In a professional library, you want to use design tokens for the colors, spacings, fonts, ... How you create this file is out of the scope of this article, we will just add a variable.scss file. This file could be imported from another library.

Create the _src/scss/variables.scss_ file, with this kind of content.

```scss
$light-text-base: #123;
$light-button-primary: #5D5;
$light-button-text: #123;
$light-button-inverse-text: #EDE;
```

#### Create the vite configuration

We have to add some information in the _vite.config.ts_ file in order to build the library with the scss modules.

**libInjectCss** for using css modules
**generateScopedName** allows to create an unique css class name (with a hash).
**rolldownOptions** is where we can list the files (input property) that are supposed to be in the final library.

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { createHash } from 'node:crypto'
import { libInjectCss } from 'vite-plugin-lib-inject-css'
import { extname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { globSync } from 'glob'

export default defineConfig({
  plugins: [
    react(),
    libInjectCss(),
  ],
  css: {
    devSourcemap: true,
    modules: {
      generateScopedName: (className, filename) => {
        const hash = createHash('sha256')
          .update(filename)
          .update(className)
          .digest('base64')
          .replace(/\//g, '')
          .replace(/\+/g, '')
          .substring(0, 5)
        return `${className}__${hash}`
      },
    },
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('src/components/main.ts', import.meta.url)),
      formats: ['es'],
    },
    rolldownOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      input: Object.fromEntries(
        globSync('src/**/*.{ts,tsx}').map((file) => [
          relative('src', file.slice(0, file.length - extname(file).length)),
          fileURLToPath(new URL(file, import.meta.url)),
        ]),
      ),
      output: {
        assetFileNames: 'assets/[name][extname]',
        entryFileNames: '[name].js',
      },
    },
  },
})

```

### Button Component

A simple Button Component. Create a directory named _components_ in _/src_. Then you can create the _Button_ and finaly an index.tsx file in _src/components/Button/_.

```typescript
'use client'

import cn from 'classnames'

import styles from './style.module.scss'

export interface Props {
  primary?: boolean
  size?: 'small' | 'medium' | 'large'
  label: string
  onClick?: () => void
}

const Button = ({
  primary = false,
  size = 'medium',
  label,
  ...props
}: Props) => (
  <button
    type="button"
    className={cn(styles.button, styles[size], {
      [styles.primary]: primary,
      [styles.secondary]: !primary,
    })}
    {...props}
  >
    {label}
  </button>
)

export { Button }
````

Then add the style.module.scss file.

```scss
 @use "../../scss/variables.scss" as *;

.button {
  display: inline-block;
  cursor: pointer;
  border: 0;
  border-radius: 3em;
  font-weight: 700;
  line-height: 1;

  &.primary {
    background-color: $light-button-primary;
    color: $light-button-inverse-text;
  }
  
  &.secondary {
    box-shadow: rgb(0 0 0 / 15%) 0 0 0 1px inset;
    background-color: transparent;
    color:  $light-button-text;
  }

  &.small {
    padding: 10px 16px;
    font-size: 12px;
  }

  &.medium {
    padding: 11px 20px;
    font-size: 14px;
  }

  &.large {
    padding: 12px 24px;
    font-size: 16px;
  }

}
```

### Text Component

A dummy Text component, in a real world UI Component lib you may want to create a _Typography_ component. The content of the file should be written in  _src/lib/components/Text/index.tsx_.

```typescript
import styles from './style.module.scss'

interface Props {
  text: string
}

const Text = ({ text }: Props) => <p className={styles.text}>{text}</p>

export { Text }
```
Next to the _index.tsx_ file, you can create the _style.module.scss_ file.
```scss
.text {
    color: red
}
```

### Building the library

Before running the build command, there is one last thing to do. The _vite.config.js_ file references a _src/components/main.ts_ file. This file lists all the components you want to package in the library, you will have to create it.

```typescript
export { Text } from './Text/index.tsx'
export { Button } from './Button/index.tsx'
```

```console
➜  new-ui-components-lib npm run build

> new-ui-components-lib@0.0.0 build
> tsc -b && vite build

rolldown-vite v7.2.5 building client environment for production...
✓ 6 modules transformed.
dist/assets/Text.css             0.02 kB │ gzip: 0.04 kB
dist/assets/Button.css           0.45 kB │ gzip: 0.27 kB
dist/components/Text/index.js    0.06 kB │ gzip: 0.07 kB
dist/components/Button/index.js  0.08 kB │ gzip: 0.09 kB
dist/components/main.js          0.12 kB │ gzip: 0.10 kB
dist/Text-D6eqnoh8.js            0.24 kB │ gzip: 0.20 kB
dist/Button-DaN_WDh5.js          2.47 kB │ gzip: 1.11 kB
✓ built in 134ms
````

Tada 🎉 ! 

#### Directives and definitions of types

2 small improvements before trying to use the library in a project.

By default de 'use client' directive is deleted, to keep it just use the preserveDirectives plugin. And to create the definitions of types for typescript, we will use vite-plugin-dts
```console
➜  npm i -D -E vite-plugin-dts rollup-preserve-directives
```
Add those plugins in the _vite.config.ts_ file.
```typescript
// other imports
import dts from 'vite-plugin-dts'
import preserveDirectives from 'rollup-preserve-directives'

// ...

// complete the plugins declaration
plugins: [
    react(),
    libInjectCss(),
    dts({
      tsconfigPath: fileURLToPath(
        new URL('tsconfig.lib.json', import.meta.url),
      ),
    }),
    preserveDirectives(),
]
```

#### Trying the library

If you want to quickly use those components in another project, you can use _npm link_.
First some lines to add in the _package.json_ file.
```json
  "name": "new-ui-components-lib",
  "private": false,
  "version": "0.0.1",
  "type": "module",
  "sideEffects": [
    "**/*.css"
  ],
  "files": [
    "dist"
  ],
  "exports": {
    "./components": {
      "import": "./dist/components/main.js",
      "types": "./dist/main.d.ts"
    }
  },
```
Then you can create the package
```console
➜  npm link
```

To use in from another local project, just run from your nextJs (for example) project root.
```console
➜  npm link new-ui-components-lib
```

You will be able to import a component just like this
```typescript
import { Text, Button } from 'my-component-lib/components'
```

## Updating the libraries

Time for a pause. We should update the libraries to make sure we use the last versions. This repository is supposed to be updated regulary and if you just follow the tutorial it is supposed to be up to date, but in your professional project it is important to keep your libs up to date.

We will use npm check updates. Just add this line in your scripts of the _package.json_ file.
```json
"ncui": "npx npm-check-updates -i",
```

I prefer to declare the exact version of the dependencies in the _package.json_ file. So I will remove all the **^** before the versions.

## Prettify and Lint Code

We will use some 2 linters to improve the quality of the code: eslint (ts) and stylelint (scss). To format the code it will be the well-known prettier which works well with eslint.

### Prettier

First install the prettier plugin on your IDE. Then you can run
```console
➜  npm i -D -E prettier
```
Here is the config file that I use (_.prettierrc_ at the root directory of the project).
```json
{
  "arrowParens": "always",
  "bracketSpacing": true,
  "endOfLine":"auto",
  "htmlWhitespaceSensitivity": "css",
  "insertPragma": false,
  "jsxBracketSameLine": false,
  "singleQuote": true,
  "jsxSingleQuote": false,
  "printWidth": 80,
  "proseWrap": "always",
  "quoteProps": "as-needed",
  "requirePragma": false,
  "semi": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "useTabs": false
}
```

### eslint

First install the eslint plugin on your IDE. Then you can run
```console
➜  npm i -D -E @eslint/js eslint eslint-import-resolver-typescript eslint-plugin-import eslint-plugin-react-hooks eslint-plugin-react-refresh eslint-plugin-prettier eslint-config-prettier @stylistic/eslint-plugin @eslint-react/eslint-plugin eslint-plugin-react-dom
```
Then you can overwrite the existing _eslint.config.js_ file that vite created with the project.
```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import eslintReact from '@eslint-react/eslint-plugin'
import reactDom from 'eslint-plugin-react-dom'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import importPlugin from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import stylistic from '@stylistic/eslint-plugin'

export default defineConfig([
  globalIgnores(['dist', '*.config.*js']),
  {
    extends: [
      js.configs.recommended,
      eslintPluginPrettierRecommended,
      reactHooks.configs.flat.recommended,
      eslintReact.configs["recommended-typescript"],
      reactDom.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactRefresh.configs.vite,
      importPlugin.flatConfigs.recommended, 
      importPlugin.flatConfigs.typescript,
    ],
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      '@stylistic/jsx-quotes': ["error", "prefer-double"],
      'arrow-body-style': 'error',
      eqeqeq: 'error',
      'no-console': 'error',
      'no-duplicate-imports': 'error',
      'no-unused-vars': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      "prettier/prettier": [
        "error",
        {
          "endOfLine": "auto"
        }
      ],
      quotes: ["error", "single", { "avoidEscape": true }],
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/unsupported-syntax': 'error',
      'react-hooks/incompatible-library': 'error',
      'import/order': [
        'error',
        {
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          groups: ['builtin', "external", "internal", 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'after',
            },
          ],
        },
      ]
    },
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parserOptions: {
        projectService: true,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: 'tsconfig.json',
        },
      },
    },
  },
  {
    linterOptions: {
      reportUnusedInlineConfigs: 'error',
			reportUnusedDisableDirectives: "error",
    },
  }
])
```

### stylelint

First install the stylint plugin on your IDE. Then you can run
```console
➜  npm i -D -E stylelint stylelint-config-standard stylelint-config-standard-scss 
```
Then you just have to create the _stylelint.config.js_ file at the root of the project.
```javascript
/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard-scss"],
  "overrides": [
    {
      "files": ["**/*.scss"],
    }
  ]
}
```
Then you can add the script in your _package.json_ file.
```json
"slint": "npx stylelint \"**/*.scss\"",
```

### Run linters

And finally you should be able to run 
```console
➜  npm run lint && npm run slint
```
A few errors may appear, especially in the imports that should be sorted (cf the configuration of the rule _import/order_).

You can configure your IDE to automatically fix linting errors when you save the file.

You should also configure a git hook to run linters on precommit. You can also add a task in your CI.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
