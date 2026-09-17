import useLanguage from '@/locale/useLanguage';
import CreateOrderModule from '@/modules/OrderModule/CreateOrderModule';

export default function OrderCreate() {
  const entity = 'order';
  const translate = useLanguage();
  const Labels = {
    PANEL_TITLE: translate('order'),
    DATATABLE_TITLE: translate('order_list'),
    ADD_NEW_ENTITY: translate('add_new_order'),
    ENTITY_NAME: translate('order'),
  };

  const configPage = {
    entity,
    ...Labels,
  };
  return <CreateOrderModule config={configPage} />;
}
