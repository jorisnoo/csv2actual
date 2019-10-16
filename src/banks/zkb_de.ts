import slugify from '@sindresorhus/slugify';
import * as moment from 'moment';

export const parseOptions = {
    header: true,
    transformHeader: header => slugify(header),
};

export const requiredHeaders = [
    'zkb-referenz', 'belastung-chf', 'gutschrift-chf', 'valuta'
];

export function transformFunction(transactions) {
    return transactions
        // Remove (epmpty) transactions without a date
        .filter(transaction => transaction.datum)

        .map(obj => {
            // Calculate amount
            const deposit = parseFloat(obj['gutschrift-chf']) || 0;
            const payment = parseFloat(obj['belastung-chf']) || 0;
            const amount = deposit * 100 - payment * 100;

            // Strip first part of description
            let payee = obj['buchungstext'];
            if (payee.startsWith('Gutschrift') || payee.startsWith('Belastung')) {
                payee = payee.substring(payee.indexOf(':') + 2)
            } else if (payee.startsWith('Einkauf')) {
                payee = payee.substring(payee.indexOf(',') + 2)
            }

            // Read date as utc (w/out timezone) and convert to js date
            const date = moment.utc(obj['valuta'], 'DD.MM.YYYY').toDate();

            return {
                imported_id: obj['zkb-referenz'],
                imported_payee: obj['buchungstext'],
                notes: obj['zahlungszweck'],
                date,
                amount,
                payee,
            };
        })
}
