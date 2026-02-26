import client from './client';

export const getExpensesAPI = (params: {
  startIndex?: number;
  category?: string;
  startDate?: number;
  endDate?: number;
}) => {
  const { startIndex = 0, category, startDate, endDate } = params;
  return client.get('/expense', {
    params: {
      startIndex,
      ...(category && { category }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    },
  });
};

export const getExpenseCategoriesAPI = () =>
  client.get('/expense/categories');

export const addExpenseAPI = (body: {
  category: string;
  desc: string;
  amount: number;
  expenseDate: string;
}) => client.post('/expense', body);

export const editExpenseAPI = (
  expenseId: string,
  body: { category: string; desc: string; amount: number; expenseDate: string },
) => client.put(`/expense/${expenseId}`, body);

export const deleteExpenseAPI = (expenseId: string) =>
  client.delete(`/expense/${expenseId}`);
