import {existsSync, readFileSync} from 'fs';
import * as Papa from 'papaparse';
import {basename} from 'path';

export function fileExists(filePath: string) {
    return existsSync(filePath);
}

export function getCurrentDirectoryBase() {
    return basename(process.cwd());
}

export function parseCsvFile(filePath: string, config: object) {
    const fileContents = readFileSync(filePath, 'utf-8');
    return Papa.parse(fileContents, config).data;
}
