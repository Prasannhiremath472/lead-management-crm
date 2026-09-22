import { Empty, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

// Shared empty-state for list/table views, replacing antd Table's bare
// default empty text with a one-line message plus an optional CTA that
// reuses the caller's own "add new" handler.
export default function EmptyState({ entityLabel = 'items', onAdd, addLabel }) {
  return (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={`No ${entityLabel} yet`}
      style={{ padding: '32px 0' }}
    >
      {onAdd && (
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          {addLabel || `Add ${entityLabel}`}
        </Button>
      )}
    </Empty>
  );
}
