import * as ts from "typescript";
const fs = require("fs");

const helpersDir = __dirname + '/../src/helpers';

// Create list of files to be transpiled.
const helperFiles = fs.readdirSync(helpersDir).map((f: string) => __dirname + '/../src/helpers/' + f);

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

  let exitCode = emitResult.emitSkipped ? 1 : 0;
  console.log(`Transpiling TS files exiting with code '${exitCode}'.`);
  process.exit(exitCode);
}

compile(helperFiles, {
  "types": ["node"],
  "outDir": "./dist/helpers",
  "typeRoots": ["./node_modules/@types"],
  "declaration": false,
});
