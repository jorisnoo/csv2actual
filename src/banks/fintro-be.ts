import * as moment from 'moment';

import {Bank} from './base';

interface FintroTransaction {
  volgnummer: string; // format: 2021-XXXX
  uitvoeringsdatum:string;
  valutadatum: string;
  bedrag: string;
  'valuta-rekening': string;
  'tegenpartij-van-de-verrichting': string;
  details: string;
  rekeningnummer: string;
}

export class FintroBe extends Bank {
    static description = 'Fintro';

    static requiredHeaders = [
        'volgnummer', 'uitvoeringsdatum', 'bedrag', 'tegenpartij-van-de-verrichting'
    ];

    static transformTransactions(transactions: FintroTransaction[]) {
        return transactions
            // Remove transactions without a full reference number (some still have 2021-) as number
            .filter(transaction => transaction.volgnummer.length > 6)
            .map(obj => {
                // Calculate amount
                const amount = Math.round(parseFloat(obj.bedrag.replace(',', '.')) * 100);

                // Read date as utc (w/out timezone) and convert to js date
                const date = moment.utc(obj.uitvoeringsdatum, 'DD/MM/YYYY').format('YYYY-MM-DD');

                return {
                    imported_id: obj.volgnummer,
                    imported_payee: obj['tegenpartij-van-de-verrichting'],
                    date,
                    amount,
                };
            });
    }
}
