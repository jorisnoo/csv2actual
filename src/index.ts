import {Command, flags} from '@oclif/command';
import slugify = require('@sindresorhus/slugify');
import cli from 'cli-ux';
import * as Configstore from 'configstore';
import * as inquirer from 'inquirer';

import {checkIfBudgetExists, getAccounts, importTransactions} from './api/actual';
import {fileExists, parseCsvFile, readFileContents} from './api/file';
import {supportedBanks} from './banks';
import {Bank} from './banks/base';

class ActualImportCsv extends Command {
    static description = 'Import transactions from a csv file into actual';

    static flags = {
        version: flags.version({char: 'v'}),
        help: flags.help({char: 'h'}),
    };

    static args = [{
        name: 'file',
        description: 'file to import, the extension must be .csv',
        required: true,
    }];

    async run() {
        const {args, /*flags*/} = this.parse(ActualImportCsv);

        // Check if file exists
        const file = args.file;
        this.checkIfFileExists(file);

        // Init Configstore
        let userConfig = new Configstore('csv2actual');

        // Parse the file
        cli.action.start(`Parsing ${file}`);
        let transactions = this.parseFile(file);
        cli.action.stop(`${transactions.length} transactions found!`);

        // Determine which bank the file matches
        cli.action.start('Determine bank');
        const bank = this.determineBank(file, transactions[0]);
        cli.action.stop(`Importing transactions from: ${bank.description}`);

        // Transform the contents to an array holding the transactions
        cli.action.start('Preparing transactions for import');
        transactions = bank.transformTransactions(transactions);
        cli.action.stop();

        // Enter Actual Budget
        await this.askForActualBudgetId(userConfig);

        // Choose Actual account to import to
        await this.determineActualAccount(userConfig);

        // Import transactions
        await this.importTransactions(userConfig, transactions);
    }

    checkIfFileExists(file) {
        try {
            if (!file.endsWith('.csv')) {
                this.error(`"${file}" is not a .csv file.`);
            }
            if (!fileExists(file)) {
                this.error(`File "${file}" cannot be found.`);
            }
        } catch (err) {
            this.error(err);
        }
    }

    parseFile(file) {
        let transactions = parseCsvFile(readFileContents(file), {
            header: true,
            transformHeader: header => slugify(header),
        });
        if (transactions.length < 1) {
            this.error(`No transactions found in file "${file}"!`);
        }
        return transactions;
    }

    determineBank(file, transaction) {
        let bank = Bank;
        Object.keys(supportedBanks).forEach(key => {
            if (supportedBanks[key].validateHeaders(transaction)) {
                bank = supportedBanks[key];
            }
        });
        if (!bank.description) {
            this.error(`"${file}" is not a valid export from one of the supported banks.`);
        }
        return bank;
    }

    async askForActualBudgetId(userConfig) {
        const defaultStash = userConfig.get('budgetId') || 'My-Stash';
        const response = await inquirer.prompt([{
            name: 'budgetId',
            message: 'Please enter the Budget ID',
            default: defaultStash,
        }]);

        // Verify budget exists
        try {
            await checkIfBudgetExists(response.budgetId);
            userConfig.set('budgetId', response.budgetId);
        } catch (e) {
            this.exit();
            this.error(e);
        }
    }

    async determineActualAccount(userConfig) {
        const accounts = await getAccounts(userConfig.get('budgetId'));
        let defaultAccount = userConfig.get('accountId') || false;
        const response = await inquirer.prompt([{
            name: 'accountId',
            type: 'list',
            message: 'Which account would you like to import into?',
            default: defaultAccount,
            choices: accounts.map(obj => {
                return {name: obj.name, value: obj.id};
            }),
        }]);
        userConfig.set('accountId', response.accountId);
        userConfig.set('accountName', accounts.find(obj => obj.id === response.accountId).name);
    }

    async importTransactions(userConfig, transactions) {
        const accountName = userConfig.get('accountName');
        const response = await inquirer.prompt({
            type: 'confirm',
            name: 'doImport',
            message: `Are you sure you want to import ${transactions.length} transactions into ${accountName}?`,
        });
        if (!response.doImport) {
            this.exit();
        }

        cli.action.start(`Importing ${transactions.length} transactions into ${accountName}`);
        try {
            await importTransactions(
                userConfig.get('budgetId'),
                userConfig.get('accountId'),
                transactions
            );
        } catch (e) {
            this.error(e.message);
        }
        cli.action.stop();
    }

}

export = ActualImportCsv;
