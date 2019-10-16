import {Command, flags} from '@oclif/command';
import {fileExists} from './files';

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

    async run() {
        const {args, flags} = this.parse(ActualImportCsv);

        // Check if file exists
        this.checkIfFileExists(args.file);

        // Future: Select which format the file is in,
        // or detect automatically

        // Parse the file

        // Transform the contents to an array holding the transactions

        // Enter Actual Budget

        // Choose Actual account to import to

        // Import transactions

    };

    checkIfFileExists(file: string) {
        try {
            if (!file.endsWith('.csv')) {
                this.error(file + ' is not a .csv file.')
            }
            if (!fileExists(file)) {
                this.error('File ' + file + ' cannot be found.')
            }
        } catch(err) {
            this.error(err)
        }
    };

}

export = ActualImportCsv;
