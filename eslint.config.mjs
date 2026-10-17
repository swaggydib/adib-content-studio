import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';
export default defineConfig([js.configs.recommended,...ts.configs.recommended,{files:['app/**/*.tsx'],plugins:{'react-hooks':hooks},rules:{'react-hooks/rules-of-hooks':'error','react-hooks/exhaustive-deps':'error'}},{files:['scripts/**/*.mjs','eslint.config.mjs'],languageOptions:{globals:{console:'readonly',process:'readonly',setTimeout:'readonly'}}},globalIgnores(['.next/**','artifacts/**','backups/**','next-env.d.ts'])]);
