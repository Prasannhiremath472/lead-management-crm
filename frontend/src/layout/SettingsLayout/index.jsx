import React from 'react';

import { Layout } from 'antd';
import { Divider, Row, Col, Typography } from 'antd';
import Card from '@/components/Card';

const { Content } = Layout;
const { Title } = Typography;

const TopCard = ({ title, cardContent }) => {
  return (
    <Card
      style={{
        color: '#595959',
        fontSize: 13,
        height: '70px',
        minHeight: 'auto',
        marginBottom: '24px',
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div className="pad20 strong" style={{ textAlign: 'center', justifyContent: 'center' }}>
        <Title level={2} style={{ marginBottom: 0, marginTop: 0 }}>
          {title}
        </Title>
      </div>
      {/* <Divider style={{ padding: 0, margin: 0 }}></Divider>
      <div className="pad15" style={{ textAlign: 'center', justifyContent: 'center' }}>
        {cardContent}
      </div> */}
    </Card>
  );
};

export default function SettingsLayout({
  children,
  topCardTitle,
  topCardContent,
  bottomCardContent,
}) {
  return (
    <Layout className="site-layout">
      <Content
        style={{
          padding: '30px 40px',
          margin: '0px auto',
          width: '100%',
          maxWidth: '1100px',
        }}
      >
        <Row gutter={[24, 24]}>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 17 }}
            lg={{ span: 18 }}
          >
            <Card
              style={{ minHeight: '480px', maxWidth: '800px' }}
              bodyStyle={{ padding: 0 }}
            >
              <Row className="pad40" gutter={[0, 0]}>
                <Col span={24}>{children}</Col>
              </Row>
            </Card>
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 7 }}
            lg={{ span: 6 }}
          >
            <TopCard title={topCardTitle} cardContent={topCardContent} />
            <Card style={{ minHeight: '280px' }}>
              <Row gutter={[0, 0]}>{bottomCardContent}</Row>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
