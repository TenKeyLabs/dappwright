import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: 'src/index.ts',
  format: ['cjs', 'esm'],
  platform: 'node',
  target: 'node22',
  dts: true,
  tsconfig: 'tsconfig.build.json',
  clean: true,
  sourcemap: true,
  deps: {
    neverBundle: ['@playwright/test'],
  },
  // tsdown would otherwise emit the CJS build as index.cjs/index.d.cts. Keep
  // microbundle's names so the published "main"/"types"/"exports" paths hold.
  outExtensions: ({ format }) => (format === 'cjs' ? { js: '.js', dts: '.d.ts' } : {}),
});
