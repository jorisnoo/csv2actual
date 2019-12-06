import {existsSync, readFileSync} from 'fs';
import * as Papa from 'papaparse';

export function fileExists(filePath: string) {
    return existsSync(filePath);
}

export function readFileContents(filePath: string) {
    return readFileSync(filePath, 'utf-8');
}

export function parseCsvFile(fileContents: string, config: object) {
    // todo: catch errors
    return Papa.parse(fileContents, config).data;
}
