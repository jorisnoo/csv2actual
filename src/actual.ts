import * as api from '@actual-app/api';

export async function checkIfBudgetExists(budgetId: string) {
    await api.runWithBudget(budgetId, () => {});
}

export async function getAccounts(budgetId: string) {
    return api.runWithBudget(budgetId, async () => {
        return await api.getAccounts();
    });
}

export async function importTransactions(budgetId: string, accountId: string, transactions) {
    return api.runWithBudget(budgetId, async () => {
        return await api.importTransactions(accountId, transactions);
    });
}
