import { Card as AntCard } from 'antd';

// Shared card surface for the app — replaces the legacy `whiteBox shadow`
// className pair with a single component wired to the theme's Card tokens
// (see src/locale/Localization.jsx).
export default function Card({ children, bodyStyle, style, className, ...rest }) {
  return (
    <AntCard
      bordered={false}
      className={className}
      style={{ borderRadius: 12, ...style }}
      styles={{ body: { padding: 24, ...bodyStyle } }}
      {...rest}
    >
      {children}
    </AntCard>
  );
}
