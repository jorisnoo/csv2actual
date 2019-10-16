import {existsSync} from 'fs';
import {basename} from 'path';

export function fileExists(filePath: string) {
    return existsSync(filePath);
}

export function getCurrentDirectoryBase() {
    return basename(process.cwd());
}
