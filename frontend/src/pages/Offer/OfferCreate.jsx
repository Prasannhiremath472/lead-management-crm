import useLanguage from '@/locale/useLanguage';
import CreateOfferModule from '@/modules/OfferModule/CreateOfferModule';

export default function OfferCreate() {
  const entity = 'offer';
  const translate = useLanguage();
  const Labels = {
    PANEL_TITLE: translate('offer'),
    DATATABLE_TITLE: translate('offer_list'),
    ADD_NEW_ENTITY: translate('add_new_offer'),
    ENTITY_NAME: translate('offer'),
  };

  const configPage = {
    entity,
    ...Labels,
  };
  return <CreateOfferModule config={configPage} />;
}
