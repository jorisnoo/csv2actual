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

        this.checkIfFileExists(args.file);

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
