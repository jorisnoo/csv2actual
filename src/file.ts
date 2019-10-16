import {existsSync, readFileSync} from 'fs';
import {basename} from 'path';
import * as Papa from 'papaparse';

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
