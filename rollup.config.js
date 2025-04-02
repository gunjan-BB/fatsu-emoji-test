import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import postcss from 'rollup-plugin-postcss';

export default [
  // **📌 Main Build: ESM + CJS + Browser**
  {
    input: 'src/index.ts',
    output: [
      { file: 'dist/index.esm.js', format: 'esm', sourcemap: true },
      { file: 'dist/index.cjs.js', format: 'cjs', sourcemap: true },
      {
        file: 'dist/index.js',
        format: 'iife',
        name: 'EmojiPicker',
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' }),
      postcss({
        extract: 'styles.css', // ✅ Generates a separate styles.css file
      }),
    ],
  },

  // **📌 Type Definitions Build (Fixing CSS Issue)**
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [
      dts(),
      // ✅ Fix: Do NOT process CSS in .d.ts build
    ],
    external: [/\.css$/], // ✅ Tell Rollup to ignore CSS files in d.ts build
  },
];
