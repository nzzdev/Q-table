import * as fs from 'fs';
import ts from "typescript";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import recursiveReadSync from 'recursive-readdir-sync';

const __dirname = dirname(fileURLToPath(import.meta.url));
const helpersDir = __dirname + '/../src/helpers';

// Create list of files to be transpiled.
const helperFiles = fs.readdirSync(helpersDir).map((f: string) => __dirname + '/../src/helpers/' + f);

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

const tsConfig: ts.CompilerOptions = {
    'target': ts.ScriptTarget.ES2015,
    'types': ['node'],
    'outDir': './dist/helpers',
    'typeRoots': ['./node_modules/@types'],
    'declaration': false,
};

compile(helperFiles, { ...tsConfig, 'outDir': './dist/helpers' });
compile(routeFiles, { ...tsConfig, 'outDir': './dist/' });
