import React from 'react';
import { Layout, Row, Col } from 'antd';

import { useSelector } from 'react-redux';
import { Content } from 'antd/lib/layout/layout';

export default function AuthLayout({ sideContent, children }) {
  return (
    <Layout>
      <Row className="authLayoutRow">
        <Col
          xs={{ span: 24, order: 1 }}
          sm={{ span: 24, order: 1 }}
          md={{ span: 11, order: 1 }}
          lg={{ span: 12, order: 1 }}
          className="authLayoutBrandCol"
        >
          {sideContent}
        </Col>
        <Col
          xs={{ span: 24, order: 2 }}
          sm={{ span: 24, order: 2 }}
          md={{ span: 13, order: 2 }}
          lg={{ span: 12, order: 2 }}
          className="authLayoutFormCol"
        >
          {children}
        </Col>
      </Row>
    </Layout>
  );
}
