import * as api from '@actual-app/api';

export async function checkIfBudgetExists(budgetId: string) {
    await api.runWithBudget(budgetId, () => {});
}

export async function getAccounts(budgetId: string) {
    return await api.runWithBudget(budgetId, () => {
        return api.getAccounts();
    });
}

export async function importTransactions(budgetId: string, accountId: string, transactions) {
    await api.runWithBudget(budgetId, () => {
        api.importTransactions(accountId, transactions);
    });
}
