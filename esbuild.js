const esbuild = require('esbuild');

const isWatch = process.argv.includes('--watch');
const isProduction = process.argv.includes('--production');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: 'esbuild-problem-matcher',

  setup(build) {
    build.onStart(() => {
      console.log('[watch] build started');
    });
    build.onEnd((result) => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        console.error(`    ${location.file}:${location.line}:${location.column}:`);
      });
      console.log('[watch] build finished');
    });
  },
};

async function build() {
  // Node.js extension build
  const nodeCtx = await esbuild.context({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    format: 'cjs',
    minify: isProduction,
    sourcemap: !isProduction,
    sourcesContent: false,
    platform: 'node',
    outfile: 'dist/extension.js',
    external: ['vscode'],
    target: 'node18',
    logLevel: isProduction ? 'silent' : 'info',
    plugins: [esbuildProblemMatcherPlugin],
  });

  // Browser extension build
  const browserCtx = await esbuild.context({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    format: 'cjs',
    minify: isProduction,
    sourcemap: !isProduction,
    sourcesContent: false,
    platform: 'browser',
    outfile: 'dist/extension.browser.js',
    external: ['vscode'],
    target: 'es2020',
    logLevel: isProduction ? 'silent' : 'info',
    plugins: [esbuildProblemMatcherPlugin],
  });

  if (isWatch) {
    await Promise.all([nodeCtx.watch(), browserCtx.watch()]);
    console.log('Watching for changes...');
  } else {
    await Promise.all([nodeCtx.rebuild(), browserCtx.rebuild()]);
    await Promise.all([nodeCtx.dispose(), browserCtx.dispose()]);
    console.log('Build complete');
  }
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
