/// <reference path="./modules.d.ts" />

import ts from 'typescript';
import recursiveReadSync from 'recursive-readdir-sync';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const routeFiles = recursiveReadSync(__dirname + '/../src/routes/');

function compile(fileNames: string[], options: ts.CompilerOptions): void {
  let program = ts.createProgram(fileNames, options);
  let emitResult = program.emit();

  let allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  allDiagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      let { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
      let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
      console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
    }
  });
}

// You should keep this in sync with tsconfig.json.
const tsConfig: ts.CompilerOptions = {
  allowSyntheticDefaultImports: true,
  declaration: false,
  esModuleInterop: true,
  module: ts.ModuleKind.ES2020,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  noImplicitAny: true,
  outDir: './dist/',
  strictNullChecks: true,
  target: ts.ScriptTarget.ES2015,
  types: ['node'],
};

// The entry point are the route files.
// Typescwript will compile anything that it finds in the tree starting from
// the route files, which are the entry point.
compile(routeFiles, tsConfig);
