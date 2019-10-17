import {Command, flags} from '@oclif/command';
import cli from 'cli-ux';
import * as Configstore from 'configstore';
import * as inquirer from 'inquirer';

import {checkIfBudgetExists, getAccounts, importTransactions} from './actual';
import {parseOptions, requiredHeaders, transformFunction} from './banks/zkb-de';
import {fileExists, parseCsvFile} from './file';

class ActualImportCsv extends Command {
    static description = 'Import transactions from a csv file to actual';

    static flags = {
        version: flags.version({char: 'v'}),
        help: flags.help({char: 'h'}),
    };

    static args = [{
        name: 'file',
        description: 'file to import, must have the .csv extension',
        required: true,
    }];

    userConfig: any;
    transactions = [];
    bank = {
        name: 'ZKB (German)',
        parseOptions,
        requiredHeaders,
        transformFunction,
    };
    file = '';

    async run() {
        const {args, /*flags*/} = this.parse(ActualImportCsv);

        // Check if file exists
        this.file = args.file;
        this.checkIfFileExists();

        // Init Configstore
        this.userConfig = new Configstore('actual-import-csv');

        // Future: Select which format the file is in,
        // or detect automatically
        // const bank = {parseOptions, transformFunction};

        // Parse the file
        cli.action.start(`Parsing ${this.file}`);
        this.parseFile();

        // Check if file is valid for import
        this.checkIfTransactionsAreValid();

        // Transform the contents to an array holding the transactions
        this.prepareTransactionsForImport();
        cli.action.stop(`${this.transactions.length} transactions found!`);

        // Enter Actual Budget
        await this.askForActualBudgetId();

        // Choose Actual account to import to
        await this.determineActualAccount();

        // Import transactions
        await this.importTransactions();
    }

    checkIfFileExists() {
        try {
            if (!this.file.endsWith('.csv')) {
                this.error(`"${this.file}" is not a .csv file.`);
            }
            if (!fileExists(this.file)) {
                this.error(`File "${this.file}" cannot be found.`);
            }
        } catch (err) {
            this.error(err);
        }
    }

    parseFile() {
        this.transactions = parseCsvFile(this.file, this.bank.parseOptions);
    }

    checkIfTransactionsAreValid() {
        if (this.transactions.length < 2) {
            this.error(`No transactions found in file "${this.file}"!`);
        }
        if (![...this.bank.requiredHeaders].every(header => header in this.transactions[0])) {
            this.error(`"${this.file}" is not a valid export from the selected bank "${this.bank.name}"!`);
        }
    }

    prepareTransactionsForImport() {
        this.transactions = this.bank.transformFunction(this.transactions);
    }

    async askForActualBudgetId() {
        const defaultStash = this.userConfig.get('budgetId') || 'My-Stash';
        const response = await inquirer.prompt([{
            name: 'budgetId',
            message: 'Please enter the Budget ID',
            default: defaultStash,
        }]);

        // Verify budget exists
        try {
            await checkIfBudgetExists(response.budgetId);
            this.userConfig.set('budgetId', response.budgetId);
        } catch (e) {
            this.exit();
            this.error(e);
        }
    }

    async determineActualAccount() {
        const accounts = await getAccounts(this.userConfig.get('budgetId'));
        let defaultAccount = this.userConfig.get('accountId') || false;
        const response = await inquirer.prompt([{
            name: 'accountId',
            type: 'list',
            message: 'Which account would you like to import to?',
            default: defaultAccount,
            choices: accounts.map(obj => {
                return {name: obj.name, value: obj.id};
            }),
        }]);
        this.userConfig.set('accountId', response.accountId);
        this.userConfig.set('accountName', accounts.find(obj => obj.id === response.accountId).name);
    }

    async importTransactions() {
        const accountName = this.userConfig.get('accountName');
        const response = await inquirer.prompt({
            type: 'confirm',
            name: 'doImport',
            message: `Are you sure you want to import ${this.transactions.length} transactions to ${accountName}?`,
        });
        if (!response.doImport) {
            this.exit();
        }

        cli.action.start(`Importing ${this.transactions.length} transactions to ${accountName}`);
        try {
            await importTransactions(
                this.userConfig.get('budgetId'),
                this.userConfig.get('accountId'),
                this.transactions
            );
        } catch (e) {
            this.error(e);
        }
        cli.action.stop();
    }

}

export = ActualImportCsv;
