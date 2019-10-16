import * as api from '@actual-app/api';

export async function checkIfBudgetExists(budgetId: string) {
    await api.runWithBudget(budgetId, () => {});
}

export async function getAccounts(budgetId: string) {
    return api.runWithBudget(budgetId, () => {
        return api.getAccounts();
    });
}
