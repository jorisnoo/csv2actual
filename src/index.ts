import {Command, flags} from '@oclif/command';
import cli from 'cli-ux';
import * as Configstore from 'configstore';
import * as inquirer from 'inquirer';

import {checkIfBudgetExists, getAccounts, importTransactions} from './actual';
import {ZkbGerman} from './banks/zkb-de';
import {fileExists, parseCsvFile, readFileContents} from './file';

class ActualImportCsv extends Command {
    static description = 'Import transactions from a csv file into actual';

    static flags = {
        version: flags.version({char: 'v'}),
        help: flags.help({char: 'h'}),
    };

    static args = [{
        name: 'file',
        description: 'file to import, must have the .csv extension',
        required: true,
    }];

    async run() {
        const {args, /*flags*/} = this.parse(ActualImportCsv);

        // Check if file exists
        const file = args.file;
        this.checkIfFileExists(file);

        // Init Configstore
        let userConfig = new Configstore('actual-import-csv');

        // Future: Select which format the file is in,
        // or detect automatically
        const bank = ZkbGerman;

        // Parse the file
        cli.action.start(`Parsing ${file}`);
        let transactions = parseCsvFile(readFileContents(file), bank.parseOptions);

        // Check if file is valid for import
        this.checkIfTransactionsAreValid(transactions, bank, file);

        // Transform the contents to an array holding the transactions
        transactions = bank.transformTransactions(transactions);
        cli.action.stop(`${transactions.length} transactions found!`);

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

    checkIfTransactionsAreValid(transactions, bank, file) {
        if (transactions.length < 2) {
            this.error(`No transactions found in file "${file}"!`);
        }
        if (!bank.validateHeaders(transactions[0])) {
            this.error(`"${file}" is not a valid export from the selected bank "${bank.description}"!`);
        }
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
            this.error(e);
        }
        cli.action.stop();
    }

}

export = ActualImportCsv;
