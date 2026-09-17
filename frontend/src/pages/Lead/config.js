export const fields = {
  name: {
    type: 'string',
    required: true,
  },
  email: {
    type: 'email',
  },
  phone: {
    type: 'phone',
  },
  company_name: {
    type: 'string',
  },
  status: {
    type: 'selectWithTranslation',
    options: [
      { value: 'new', label: 'new' },
      { value: 'contacted', label: 'contacted' },
      { value: 'qualified', label: 'qualified' },
      { value: 'converted', label: 'converted' },
      { value: 'lost', label: 'lost' },
    ],
  },
  source: {
    type: 'select',
    options: [
      { value: 'website', label: 'Website' },
      { value: 'referral', label: 'Referral' },
      { value: 'cold-call', label: 'Cold Call' },
      { value: 'social', label: 'Social' },
      { value: 'other', label: 'Other' },
    ],
  },
  notes: {
    type: 'textarea',
  },
};
