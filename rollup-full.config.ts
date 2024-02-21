import type { LoggingFunction, RollupLog, RollupOptions } from 'rollup'
import { defineConfig } from 'rollup'
import terser from '@rollup/plugin-terser'
import postcssCombineDuplicatedSelectors from 'postcss-combine-duplicated-selectors'
import cssnanoPlugin from 'cssnano'
import postcss from 'rollup-plugin-postcss'
import postcssImport from 'postcss-import'
import ts from 'rollup-plugin-ts'
import pkg from './package.json' assert { type: 'json' }

const srcDir = './src'
const distDir = './dist'
const cssComponentsDir = `${distDir}/css/modules`
const input = `${srcDir}/index.ts`

// eslint-disable-next-line node/prefer-global/process
const productionMode = !process.env.ROLLUP_WATCH

export const banner = `/*!
* ${pkg.name} ${pkg.version}
* ${pkg.repository.url}
* Author ${pkg.author}
* Released under the ${pkg.license} License
*/
`

const cssComponents = [
  [
    'themes/_custom.pcss',
    'custom-theme.css',
  ],
]

const cssComponentsRollup = cssComponents.map((component) => {
  const src = `${srcDir}/styles/${component[0]}`
  const dst = `${cssComponentsDir}/${component[1]}`

  return {
    input: src,
    output: {
      file: dst,
    },
    plugins: postcss({
      extract: true,
      plugins: [
        postcssImport(),
        postcssCombineDuplicatedSelectors(),
        productionMode && cssnanoPlugin({
          preset: ['default', {
            discardComments: {
              removeAll: true,
            },
          }],
        }),
      ],
    }),
    onwarn(warning: RollupLog, warn: LoggingFunction) {
      if (warning.code === 'FILE_NAME_CONFLICT')
        return
      warn(warning)
    },
  }
})

export const terserPlugin = terser({
  toplevel: true,
  format: {
    quote_style: 1,
    comments: /^!/,
  },
  mangle: {
    properties: {
      regex: /^_/,
      reserved: ['__esModule', '_ccRun'],
      keep_quoted: true,
    },
  },
  compress: {
    passes: 3,
    pure_funcs: ['_log', 'console.log'],
  },
})

export default defineConfig(
  [{
    input,
    output: [
      {
        file: pkg.main,
        format: 'umd',
        name: pkg.shortName,
        banner,
      },
      {
        file: pkg.module,
        format: 'esm',
        exports: 'named',
        banner,
      },
    ],
    plugins: [
      ts(),
      productionMode && terserPlugin,
    ],
  }, {
    input: `${srcDir}/styles/index.pcss`,
    output: {
      file: `${distDir}/css/${pkg.shortName}.css`,
    },
    plugins: postcss({
      extract: true,
      plugins: [
        postcssImport(),
        postcssCombineDuplicatedSelectors(),
        productionMode && cssnanoPlugin({
          preset: ['default', {
            discardComments: {
              removeAll: true,
            },
          }],
        }),
      ],
    }),
    onwarn(warning, warn) {
      if (warning.code === 'FILE_NAME_CONFLICT')
        return
      warn(warning)
    },
  }, ...cssComponentsRollup] as RollupOptions[],
)
