import dayjs from 'dayjs';
import useLanguage from '@/locale/useLanguage';

import { useMoney, useDate } from '@/settings';
import QuoteDataTableModule from '@/modules/QuoteModule/QuoteDataTableModule';

export default function Quote() {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const entity = 'quote';
  const { moneyFormatter } = useMoney();

  const searchConfig = {
    entity: 'client',
    displayLabels: ['name'],
    searchFields: 'name',
  };
  const deleteModalLabels = ['number', 'client.name'];
  const dataTableColumns = [
    {
      title: translate('Number'),
      dataIndex: 'number',
    },
    {
      title: translate('Client'),
      dataIndex: ['client', 'name'],
    },
    {
      title: translate('Date'),
      dataIndex: 'date',
      render: (date) => {
        return dayjs(date).format(dateFormat);
      },
    },
    {
      title: translate('expired Date'),
      dataIndex: 'expiredDate',
      render: (date) => {
        return dayjs(date).format(dateFormat);
      },
    },
    {
      title: translate('Total'),
      dataIndex: 'total',
      onCell: () => {
        return {
          style: {
            textAlign: 'right',
            whiteSpace: 'nowrap',
            direction: 'ltr',
          },
        };
      },
      render: (total, record) => {
        return moneyFormatter({ amount: total, currency_code: record.currency });
      },
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
    },
  ];

  const Labels = {
    PANEL_TITLE: translate('quote'),
    DATATABLE_TITLE: translate('quote_list'),
    ADD_NEW_ENTITY: translate('add_new_quote'),
    ENTITY_NAME: translate('quote'),
  };

  const configPage = {
    entity,
    ...Labels,
  };
  const config = {
    ...configPage,
    dataTableColumns,
    searchConfig,
    deleteModalLabels,
  };

  return <QuoteDataTableModule config={config} />;
}
