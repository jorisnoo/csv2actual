export abstract class Bank {
    static description: string;
    static requiredHeaders: any;
    static validateHeaders(transaction): boolean {
        return this.requiredHeaders.every(header => header in transaction);
    }
    static transformTransactions(transactions) {
        return transactions;
    }
}
