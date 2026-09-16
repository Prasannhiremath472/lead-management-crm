import { Layout } from 'antd';

import useLanguage from '@/locale/useLanguage';
import { SOURCE_CODE_URL } from '@/config/serverApiConfig';

const { Footer } = Layout;

const FooterContent = () => {
  const translate = useLanguage();
  return (
    <Footer style={{ textAlign: 'center' }}>
      <a href={SOURCE_CODE_URL} target="_blank" rel="noreferrer">
        {translate('Source Code')}
      </a>
    </Footer>
  );
};

export default FooterContent;
