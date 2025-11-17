import React from 'react';
import styled from 'styled-components';
import Header from './Header';
import Sidebar from './Sidebar';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
`;

const Layout = ({ children }) => {
  return (
    <LayoutContainer>
      <Header />
      <ContentWrapper>
        <Sidebar />
        {children}
      </ContentWrapper>
    </LayoutContainer>
  );
};

export default Layout;

