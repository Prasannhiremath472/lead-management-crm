import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import OrderForm from '@/modules/OrderModule/Forms/OrderForm';

export default function CreateOrderModule({ config }) {
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={OrderForm} />
    </ErpLayout>
  );
}
