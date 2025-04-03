import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import postcss from 'rollup-plugin-postcss';
import terser from '@rollup/plugin-terser';

export default [
  // **📌 Main Build: ESM + CJS + IIFE**
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.mjs', // ✅ Use only `index.mjs` for ESM
        format: 'esm',
        sourcemap: true,
        exports: 'named', // ✅ Ensures named exports for ESM
      },
      {
        file: 'dist/index.cjs', // ✅ Use only `index.cjs` for CJS
        format: 'cjs',
        sourcemap: true,
        exports: 'named', // ✅ Ensures named exports for CommonJS
      },
      {
        file: 'dist/index.js',
        format: 'iife',
        name: 'EmojiPicker',
        sourcemap: true,
        plugins: [terser()], // ✅ No named import needed
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' }),
      postcss({
        extract: 'styles.css', // ✅ Ensures styles.css is created
      }),
    ],
  },

  // **📌 Type Definitions Build**
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
    external: [/\.css$/], // ✅ Ignore CSS files in type definitions
  },
];
