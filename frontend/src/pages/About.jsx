import { Result } from 'antd';

import useLanguage from '@/locale/useLanguage';
import { SOURCE_CODE_URL } from '@/config/serverApiConfig';

const About = () => {
  const translate = useLanguage();
  return (
    <Result
      status="info"
      title={translate('About')}
      subTitle={translate('CRM / ERP for accounting, invoicing, and quotes')}
      extra={
        <p>
          {translate('This application is licensed under the AGPLv3')}
          {' — '}
          <a href={SOURCE_CODE_URL} target="_blank" rel="noreferrer">
            {translate('Source Code')}
          </a>
        </p>
      }
    />
  );
};

export default About;
