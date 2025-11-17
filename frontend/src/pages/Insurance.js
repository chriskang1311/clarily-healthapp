import React from 'react';
import styled from 'styled-components';

const MainContent = styled.main`
  flex: 1;
  padding: 48px 64px;
`;

const Title = styled.h1`
  font-size: 48px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin: 0;
`;

const Insurance = () => {
  return (
    <MainContent>
      <Title>Insurance</Title>
      <p>Your insurance information will appear here.</p>
    </MainContent>
  );
};

export default Insurance;

