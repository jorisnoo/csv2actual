import {BelfiusBe} from './banks/belfius-be';
import {NeonEn} from './banks/neon-en';
import {SparkasseDe} from './banks/sparkasse-de';
import {ZkbDe} from './banks/zkb-de';

export const supportedBanks = {
    'belfius-be': BelfiusBe,
    'sparkasse-de': SparkasseDe,
    'zkb-de': ZkbDe,
    'neon-en': NeonEn,
};
