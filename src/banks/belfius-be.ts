import * as moment from 'moment';

import {Bank} from './base';

export class BelfiusBe extends Bank {
    static description = 'Belfius (Belgium)';

    static requiredHeaders = [
        'transactie', 'boekingsdatum', 'bedrag',
    ];

    static transformTransactions(transactions) {
        return transactions
            // Remove (epmpty) transactions without a date
            .filter(transaction => transaction.boekingsdatum)
            .map(obj => {
                // Calculate amount
                const amount = parseFloat(obj.bedrag.replace(',', '.')) * 100;
                const reference = obj.transactie.match(/(REF)(?!.*\1)\. : (.*) VAL\. \d{2}-\d{2}/)[2].trim();
                let payee = obj['naam-tegenpartij-bevat'].trim();
                if (!payee) {
                    payee = obj.mededelingen;
                }
                // Read date as utc (w/out timezone) and convert to js date
                const date = moment.utc(obj.boekingsdatum, 'DD/MM/YYYY').format('YYYY-MM-DD');

                return {
                    imported_id: reference,
                    imported_payee: obj.transactie,
                    notes: obj.mededelingen,
                    date,
                    amount,
                    payee,
                };
            });
    }

}
