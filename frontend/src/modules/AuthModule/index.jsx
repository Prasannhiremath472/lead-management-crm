import useLanguage from '@/locale/useLanguage';

import { Layout, Divider, Typography } from 'antd';

import AuthLayout from '@/layout/AuthLayout';
import SideContent from './SideContent';
import Card from '@/components/Card';

const { Content } = Layout;
const { Title } = Typography;

const AuthModule = ({ authContent, AUTH_TITLE, isForRegistre = false }) => {
  const translate = useLanguage();
  return (
    <AuthLayout sideContent={<SideContent />}>
      <Content
        style={{
          padding: isForRegistre ? '40px 30px 30px' : '100px 30px 30px',
          maxWidth: '440px',
          margin: '0 auto',
        }}
      >
        <Card className="authFormCard">
          <Title level={1}>{translate(AUTH_TITLE)}</Title>

          <Divider />
          <div className="site-layout-content">{authContent}</div>
        </Card>
      </Content>
    </AuthLayout>
  );
};

export default AuthModule;
