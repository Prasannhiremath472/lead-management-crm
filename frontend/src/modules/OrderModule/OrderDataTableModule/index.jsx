import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';

export default function OrderDataTableModule({ config }) {
  return (
    <ErpLayout>
      <ErpPanel config={config}></ErpPanel>
    </ErpLayout>
  );
}
