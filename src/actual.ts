import {runWithBudget} from '@actual-app/api';

export async function checkIfBudgetExists(budgetId: string) {
    await runWithBudget(budgetId, () => {});
}
