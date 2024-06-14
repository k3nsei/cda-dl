/**
 * @see https://www.npmjs.com/package/lint-staged
 */
const config = {
  '.husky/!(_){/**,}': 'npx --no -- prettier --write --parser sh',
  '*.{ts,js,mjs,cjs,json,md,sh,yml,yaml}': 'npx --no -- prettier --write --ignore-unknown',
  'src/*.ts': 'npx --no -- eslint --fix',
};

export default config;
