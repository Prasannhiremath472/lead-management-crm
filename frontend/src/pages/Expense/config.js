export const fields = {
  category_id: {
    type: 'asyncEntitySelect',
    entity: 'expenseCategory',
    displayLabels: ['name'],
    searchFields: 'name',
    label: 'expense_category',
  },
  description: {
    type: 'textarea',
  },
  amount: {
    type: 'currency',
    required: true,
  },
  date: {
    type: 'date',
    required: true,
  },
  receipt: {
    type: 'string',
  },
  notes: {
    type: 'textarea',
  },
};
