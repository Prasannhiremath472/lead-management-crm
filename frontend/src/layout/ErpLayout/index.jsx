import { ErpContextProvider } from '@/context/erp';

import { useSelector } from 'react-redux';
import Card from '@/components/Card';

export default function ErpLayout({ children }) {
  return (
    <ErpContextProvider>
      <Card
        style={{
          margin: '32px auto',
          width: '100%',
          maxWidth: '1100px',
          minHeight: '600px',
        }}
      >
        {children}
      </Card>
    </ErpContextProvider>
  );
}
