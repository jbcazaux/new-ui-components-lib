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

Note: If you have problems with SWC, or don't use any SWC plugin, you can also switch to the Oxc transpiler. You just have to install **@vitejs/plugin-react** and import it instead of **@vitejs/plugin-react-swc** in the _vite.config.ts_ file. Sometimes you can see this warning
```
[vite:react-swc] We recommend switching to `@vitejs/plugin-react` for improved performance as no swc plugins are used. More information at https://vite.dev/rolldown
```
The **@vitejs/plugin-react** will use babel transpiler if you use babel plugin (like the react-compiler) and the Oxc transpiler otherwise (see [https://vite.dev/guide/rolldown#utilizing-oxc-s-react-refresh-transform](https://vite.dev/guide/rolldown#utilizing-oxc-s-react-refresh-transform)).


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
You will create a _README.md_ later if you want, just delete the file for now. The _index.html_ was used for the app, we can delete it safely.
```console
➜  rm README.md index.html
```

No need of the _public_ directory either.
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

In the _package.json_ file, you can remove the "preview" script.

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

interface Props {
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

A dummy Text component, in a real world UI Component lib you may want to create a _Typography_ component. The content of the file should be written in  _src/components/Text/index.tsx_.

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

To use it from another local project, just run from your nextJs (for example) project root.
```console
➜  npm link new-ui-components-lib
```

You will be able to import a component just like this
```typescript
import { Text, Button } from 'new-ui-components-lib/components'
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

## Storybook

What would be a UI Component Library without a **storybook** to see and test the components ?

### Install

Run the storybook install command
```console
➜  npm create storybook@latest
```
During the install, 2 questions are asked :

You can skip the onboarding page
```
√ New to Storybook? » No: Skip onboarding & don't ask again
```
And you can install the Minimal configuration
```
√ What configuration should we install? » Minimal: Component dev only
```

Once the install is over, storybook is run in your browser. You can just stop the server from your terminal. We will create our own stories.

### Finish the configuration

Some examples are created by default, you can just delete them, we will create our owns.
```console
➜ rm -Rf src/stories
```
We will install the a11y plugin which is helpfull for running some accessibility tests.
```console
➜ npx storybook add @storybook/addon-a11y
```
And the docs plugin
```console
➜ npx storybook add @storybook/addon-docs
```

vite-dts plugin must be configured to not generate the types definitions of the stories.ts files. You can update the configuration in the _vite.config.ts_ file

```typescript
  dts({
  tsconfigPath: fileURLToPath(
    new URL('tsconfig.lib.json', import.meta.url),
  ),
  exclude: '**/*.stories.ts',
}),
```
We must add the _.storybook/_ directory to the ts config, by updating _tsconfig.lib.json_ as this
```json
 "include": ["src/**/*.ts", "src/**/*.tsx", ".storybook/**.ts"],
 ```

 A small utility lib for handling aliases
 ```console
 ➜ npm i -D -E vite-tsconfig-paths
```

Then we will configure storybook to use the new CSF (Component Story Format) feature. Plus, we will create the stories files just next to the components definition, not in the \_\_tests\_\_ directory. Replace the content of _.storybook/main.ts with
```typescript
import { withoutVitePlugins } from '@storybook/builder-vite'
import { defineMain } from '@storybook/react-vite/node'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineMain({
  framework: '@storybook/react-vite',
  stories: [
    {
      directory: '../src/components',
      files: '**/*.stories.*',
    },
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  async viteFinal(config) {
    return {
      ...config,
      plugins: [
        ...(await withoutVitePlugins(config.plugins, [
          'vite:dts',
          'vite:lib-inject-css',
        ])),
        tsconfigPaths(),
      ],
    }
  },
})
```

The _.storybook/preview.ts_ should also be updated
```typescript
import addonA11y from '@storybook/addon-a11y'
import addonDocs from '@storybook/addon-docs'
import { definePreview } from '@storybook/react-vite'

export default definePreview({
  addons: [addonA11y(), addonDocs()],
  tags: ['autodocs'],
  parameters: {
    a11y: {
      options: { xpath: true },
    },
  },
})
```

Add the @Storybook alias in the _tsconfig.lib.json_ so we can use it the stories.
```typescript
"compilerOptions": {
  // ...
  /* aliases */
  "paths": {
    "@/storybook/*": ["./.storybook/*"]
  }
  // ...
}
```

You can get rid off the **^** in the versions of the lib we just installed in your _package.json_ file and everything should be ok to write our stories.

### Stories

#### Text.stories.ts

Let's begin with the stories of the simple Text component _src/components/Text/Text.stories.ts
```typescript
import preview from '@/storybook/preview'

import { Text } from '.'

const meta = preview.meta({
  title: 'Text',
  component: Text,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
})

export const Primary = meta.story({
  args: {
    text: 'hello world !',
  },
})
```
We should add documentation for the Props of the Text in _src/components/Text/index.tsx_.
```typescript
interface Props {
  /** Text to display */
  text: string
}
```

#### Button.stories.ts

And now the stories of the Button component _src/components/Button/Button.stories.ts
```typescript
import preview from '@/storybook/preview'

import { Text } from '.'

const meta = preview.meta({
  title: 'Text',
  component: Text,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
})

export const Primary = meta.story({
  args: {
    text: 'hello world !',
  },
})
```
We should add documentation for the Props of the Button in _src/components/Button/index.tsx_.
```typescript
interface Props {
  /** Is this the principal call to action on the page? */
  primary?: boolean
  /** How large should the button be? */
  size?: 'small' | 'medium' | 'large'
  /** Button contents */
  label: string
  /** Optional click handler */
  onClick?: () => void
}
```

### Run storybook

A simple 
```console
➜ npm run storybook
```

Et voilà !

## Unit testing

Time to add some unit tests !

### Install

```console
➜ npm install -D -E vitest @testing-library/react jsdom @vitest/coverage-v8
```

To reuse the vite configuration you can just add a **test** entry in the file _vite.config.ts_
```typescript
test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './__tests__/setupVitest.ts',
  },
```
You will have to add this line at the top of the file too
```typescript
/// <reference types="vitest/config" />
```

And juste like we have ignored stories and types files from the build of the library, we have to ignore test files.
```typescript
// ...
input: Object.fromEntries(
    globSync('src/**/*.{ts,tsx}', {
      ignore: [
        'src/**/*types*.ts',
        'src/**/*stories*.ts',
        'src/**/*test.{ts,tsx}',
      ],
// ...
```

As you can see, there is a \_\__tests\_\_/setupVitest.ts to create at the root of the project, it will handle the setup of all the vitest tests.
```typescript
import 'jsdom'
```

And finally add a script "test" in the scripts property of your _package.json_ file.

```json
"test": "vitest"
```

### Text.test.tsx

This file will be created next to the _index.tsx_ and _Text.stories.ts_ files in the _src/components/Text/_ directory.

```typescript
import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'

import { Text } from '.'

describe('Text Component', () => {
  test('should display text', () => {
    render(<Text text="hello world" />)

    const txt = screen.getByText('hello world')

    expect(txt).toBeTruthy()
  })
})
```
### Button.test.tsx

Create the file next to the component as before.

```typescript
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'

import { Button } from '.'

describe('Button Component', () => {
  test('should display Button', () => {
    render(<Button label="My Button" />)

    const btn = screen.getByRole('button', { name: 'My Button' })

    expect(btn).toBeTruthy()
  })

  test('should handle click', () => {
    const handleClick = vi.fn()
    render(<Button label="My Button" onClick={handleClick} />)

    const btn = screen.getByRole('button')
    fireEvent.click(btn)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Run & Coverage

Just run
```console
➜ npm test
```
To see the results of the tests.

If you want to add coverage you can add a script entry in your _package.json_
```json
"coverage": "vitest run --coverage"
```
and update the test entry of your _vite.config.ts_ file
```typescript
// ...
test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './__tests__/setupVitest.ts',
    coverage: {
      provider: 'v8',
      include: ['src/**/*'],
      exclude: ['src/components/main.ts', 'src/components/**/*.stories.ts'],
      clean: true
    },
  },
// ...  
```

Do not forget to add the _coverage/_ directory in your _.gitignore_.

