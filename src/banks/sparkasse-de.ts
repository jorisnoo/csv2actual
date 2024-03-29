import * as moment from 'moment';

import {Bank} from './base';

export class SparkasseDe extends Bank {
    static description = 'Sparkasse';

    static requiredHeaders = [
        'auftragskonto', 'buchungstag', 'valutadatum', 'buchungstext', 'verwendungszweck', 'glaeubiger-id', 'mandatsreferenz', 'kundenreferenz-end-to-end', 'sammlerreferenz', 'lastschrift-ursprungsbetrag', 'auslagenersatz-ruecklastschrift', 'beguenstigter-zahlungspflichtiger', 'kontonummer-iban', 'bic-swift-code', 'betrag', 'waehrung', 'info',
    ];

    static transformTransactions(transactions) {
        return transactions
            .filter(transaction => transaction.valutadatum)
            .map(obj => {
                const amount = parseFloat(obj.betrag.replace(',', '')) || 0;
                const payee = obj['beguenstigter-zahlungspflichtiger'];

                // Read date as utc (w/out timezone) and convert to js date
                const date = moment.utc(obj.valutadatum, 'DD.MM.YYYY').format('YYYY-MM-DD');

                return {
                    notes: obj.verwendungszweck,
                    date,
                    amount,
                    payee_name: payee,
                    imported_payee: payee,
                };
            });
    }

}
