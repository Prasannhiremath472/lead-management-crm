export const fields = {
  name: {
    type: 'string',
    required: true,
  },
  sku: {
    type: 'string',
  },
  category_id: {
    type: 'asyncEntitySelect',
    entity: 'productCategory',
    displayLabels: ['name'],
    searchFields: 'name',
    label: 'product_category',
  },
  description: {
    type: 'textarea',
  },
  price: {
    type: 'currency',
  },
  quantity: {
    type: 'number',
  },
  unit: {
    type: 'string',
  },
  tax_rate: {
    type: 'number',
  },
};
