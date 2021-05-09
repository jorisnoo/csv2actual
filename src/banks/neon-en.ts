import {Bank} from './base';

export class NeonEn extends Bank {
    static description = 'Neon';

    static requiredHeaders = [
        'incoming-amount-outgoing-amount', 'date', 'description',
    ];

    static transformTransactions(transactions) {
        return transactions
            .filter(transaction => transaction.date)
            .map(obj => {
                // Calculate amount
                const amount = Math.round(parseFloat(obj['incoming-amount-outgoing-amount']) * 100);

                return {
                    imported_payee: obj.description,
                    payee_name: obj.description,
                    date: obj.date,
                    amount,
                };
            });
    }

}
