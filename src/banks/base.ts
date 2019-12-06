import slugify from '@sindresorhus/slugify';

export abstract class Bank {
    static requiredHeaders: any;
    static parseOptions = {
        header: true,
        transformHeader: header => slugify(header),
    };
    static validateHeaders(transaction): boolean {
        return this.requiredHeaders.every(header => header in transaction);
    }
}
