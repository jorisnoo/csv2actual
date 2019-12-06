# csv2actual

A command line utility to import bank transactions as csv into [Actual](https://actualbudget.com/).

## Why?

While Actual can import bank account statements through the "Quicken" format, not all banks support this.
Instead, they may allow exporting transaction data in a custom format. 
This utility aims to enable importing data from unsupported banks, so they don't need to be entered by hand.

## Supported banks

- Zürcher Kantonalbank (German)

If you'd like to see support for another bank, please open an issue or PR 💫

## Installation

For now, the easiest way to use the cli is to clone this repository.
You'll need to have [node](https://nodejs.org/en/download/) installed first.

```bash
git clone git@github.com:jorisnoo/csv2actual.git
cd csv2actual

npm install # or: yarn install

# Make the command available globally
npm link # or: yarn link
```

## Usage

To import transactions from a file, run:

```bash
csv2actual filename.csv
```

You will be prompted to enter your buget and choose an account to import into.
