import { defineConfig } from 'rollup'
import ts from 'rollup-plugin-ts'
import { banner, terserPlugin } from './rollup-full.config'
import pkg from './package.json' assert { type: 'json' }

const distDir = './dist/core'
const fileName = `${pkg.shortName}-core`

export default defineConfig(
  [
    {
      input: './src/index.ts',
      output: [
        {
          file: `${distDir}/${fileName}.umd.js`,
          format: 'umd',
          name: pkg.shortName,
          banner,
        },
        {
          file: `${distDir}/${fileName}.esm.js`,
          format: 'esm',
          exports: 'named',
          banner,
        },
      ],
      plugins: [
        terserPlugin,
        ts(),
      ],
    },
  ],
)
