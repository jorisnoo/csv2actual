# actual-import-csv

A command line utility to import bank transactions as csv into [Actual](https://actualbudget.com/).

## Why?

While Actual can import bank account statements through the "Quicken" format, not all banks support this.
Instead, they may allow exporting transaction data in custom formats.

## Supported banks

- Zürcher Kantonalbank (German Export)

If you'd like to see support for another bank, please open an issue or PR 💫

## Installation

For now, the easiest way to use the cli is to clone this repository.
You'll need to have [node](https://nodejs.org/en/download/) installed first.

```bash
git clone git@github.com:jorisnoo/actual-import-csv.git
cd actual-import-csv

npm install # or: yarn install

# Make the command available globally
npm link # or: yarn link
```

## Usage

To import transactions, run

```bash
actual-import-csv filename.csv
```
