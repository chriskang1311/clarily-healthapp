import React from 'react';
import styled from 'styled-components';
import { useTheme } from 'styled-components';

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StethoscopeSvg = styled.svg`
  width: 32px;
  height: 32px;
`;

const BrandName = styled.span`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
`;

const Logo = () => {
  const theme = useTheme();
  const primaryColor = theme.colors.primary;

  return (
    <LogoContainer>
      <StethoscopeSvg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        {/* Stethoscope forming a heart shape */}
        <path
          d="M16 8 C14 6, 10 6, 10 10 C10 14, 16 20, 16 20 C16 20, 22 14, 22 10 C22 6, 18 6, 16 8 Z"
          fill={primaryColor}
          stroke={primaryColor}
        />
        {/* Stethoscope tube */}
        <path
          d="M16 12 L16 16 M12 16 C10 16, 8 18, 8 20 C8 22, 10 24, 12 24 M20 16 C22 16, 24 18, 24 20 C24 22, 22 24, 20 24"
          stroke={primaryColor}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </StethoscopeSvg>
      <BrandName>Clarily</BrandName>
    </LogoContainer>
  );
};

export default Logo;

