import { ConfigProvider } from 'antd';

export default function Localization({ children }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#4F46E5',
          colorLink: '#4F46E5',
          colorInfo: '#4F46E5',
          colorSuccess: '#52c41a',
          colorWarning: '#faad14',
          colorError: '#ff4d4f',
          borderRadius: 8,
          borderRadiusLG: 12,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontSize: 14,
          fontWeightStrong: 600,
          colorBgLayout: '#FAFAFB',
          colorBgContainer: '#FFFFFF',
          colorBorder: '#D0D5DD',
          colorBorderSecondary: '#E4E7EC',
          colorText: '#344054',
          colorTextSecondary: '#667085',
          colorTextHeading: '#101828',
        },
        components: {
          Card: {
            borderRadiusLG: 12,
            boxShadowTertiary: '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)',
          },
          Button: { borderRadius: 8, controlHeight: 36, fontWeight: 500 },
          Menu: {
            itemBorderRadius: 8,
            itemSelectedBg: '#EEF2FF',
            itemSelectedColor: '#4F46E5',
            itemHeight: 40,
            subMenuItemBg: 'transparent',
          },
          Table: {
            headerBg: '#F5F6F8',
            headerColor: '#344054',
            borderColor: '#E4E7EC',
            cellPaddingBlock: 14,
            headerSplitColor: 'transparent',
          },
          Layout: { headerBg: '#FFFFFF', siderBg: '#FFFFFF', bodyBg: '#FAFAFB' },
          Input: { borderRadius: 8, controlHeight: 36 },
          Select: { borderRadius: 8, controlHeight: 36 },
          Tag: { borderRadiusSM: 6 },
          Modal: { borderRadiusLG: 12 },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
