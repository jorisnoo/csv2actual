import {Command, flags} from '@oclif/command';
import cli from 'cli-ux';
import * as Configstore from 'configstore';
import * as inquirer from 'inquirer';

import {fileExists, parseCsvFile} from './file';
import {checkIfBudgetExists, getAccounts, importTransactions} from './actual';

import {parseOptions, transformFunction} from "./banks/zkb_de";

class ActualImportCsv extends Command {
    static description = 'describe the command here';

    static flags = {
        version: flags.version({char: 'v'}),
        help: flags.help({char: 'h'}),
    };

    static args = [{
        name: 'file',
        description: 'file to import, must have the .csv extension',
        required: true,
    }];

    config: any;

    async run() {
        const {args, flags} = this.parse(ActualImportCsv);

        // Check if file exists
        this.checkIfFileExists(args.file);

        // Init Configstore
        this.config = new Configstore('actual-import-csv');

        // Future: Select which format the file is in,
        // or detect automatically
        const bank = {parseOptions, transformFunction};

        // Parse the file
        let transactions = this.parseFile(args.file, bank.parseOptions);

        // Transform the contents to an array holding the transactions
        transactions = bank.transformFunction(transactions);

        // Enter Actual Budget
        await this.askForActualBudgetId();

        // Choose Actual account to import to
        await this.determineActualAccount();

        // Import transactions
        await this.importTransactions(transactions);
    }

    checkIfFileExists(file: string) {
        try {
            if (!file.endsWith('.csv')) {
                this.error(`${file} is not a .csv file.`);
            }
            if (!fileExists(file)) {
                this.error(`File ${file} cannot be found.`);
            }
        } catch (err) {
            this.error(err);
        }
    }

    parseFile(file: string, parseConfig: object) {
        return parseCsvFile(file, parseConfig);
    }

    async askForActualBudgetId() {
        const defaultStash = this.config.get('budgetId') || 'My-Stash';
        const response = await inquirer.prompt([{
            name: 'budgetId',
            message: 'Please enter the Budget ID (Located in the settings under "Advanced")',
            default: defaultStash,
        }]);

        // Verify budget exists
        try {
            await checkIfBudgetExists(response.budgetId);
            this.config.set('budgetId', response.budgetId);
        } catch (e) {
            this.exit();
        }
    }

    async determineActualAccount() {
        const accounts = await getAccounts(this.config.get('budgetId'));
        let defaultAccount = this.config.get('accountId') || false;
        const response = await inquirer.prompt([{
            name: 'accountId',
            type: 'list',
            message: 'Which account would you like to import to?',
            default: defaultAccount,
            choices: accounts.map(obj => {
                return {name: obj.name, value: obj.id};
            }),
        }]);
        this.config.set('accountId', response.accountId);
        this.config.set('accountName', accounts.find(obj => obj.id === response.accountId).name);
    }

    async importTransactions(transactions) {
        const accountName = this.config.get('accountName');
        const response = await inquirer.prompt({
            type: 'confirm',
            name: 'doImport',
            message: `Are you sure you want to import ${transactions.length} transactions to ${accountName}?`,
        });
        if (!response.doImport) {
            this.exit();
        }

        cli.action.start(`Importing ${transactions.length} transactions to ${accountName}`);
        try {
            await importTransactions(
                this.config.get('budgetId'),
                this.config.get('accountId'),
                transactions,
            );
        } catch (e) {
            this.error(e);
        }
        cli.action.stop();
    }

}

export = ActualImportCsv;
