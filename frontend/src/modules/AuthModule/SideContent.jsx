import { Space, Layout, Divider, Typography } from 'antd';
import logo from '@/style/images/logo.svg';
import useLanguage from '@/locale/useLanguage';
import { useSelector } from 'react-redux';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function SideContent() {
  const translate = useLanguage();

  return (
    <div className="sideContentPanel">
      <div className="sideContentBlob sideContentBlob-1" aria-hidden="true" />
      <div className="sideContentBlob sideContentBlob-2" aria-hidden="true" />
      <div className="sideContentBlob sideContentBlob-3" aria-hidden="true" />
      <Content
        style={{
          padding: '150px 30px 30px',
          width: '100%',
          maxWidth: '450px',
          margin: '0 auto',
        }}
        className="sideContent"
      >
        <div style={{ width: '100%' }}>
          <img
            src={logo}
            alt="CRM"
            className="sideContentLogo"
            style={{ margin: '0 0 40px', display: 'block' }}
            height={63}
            width={220}
          />

          <Title level={1} style={{ fontSize: 28 }} className="sideContentTitle">
            CRM / ERP
          </Title>
          <Text className="sideContentTagline">
            Accounting / Invoicing / Quote App
          </Text>

          <div className="space20"></div>
        </div>
      </Content>
    </div>
  );
}
