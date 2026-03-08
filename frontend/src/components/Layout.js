import React, { useState } from 'react';
import styled from 'styled-components';
import Header from './Header';
import Sidebar from './Sidebar';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const Backdrop = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: ${props => props.visible ? 'block' : 'none'};
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 150;
  }
`;

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <LayoutContainer>
      <Header onMenuClick={openSidebar} />
      <ContentWrapper>
        <Backdrop visible={sidebarOpen} onClick={closeSidebar} />
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        {children}
      </ContentWrapper>
    </LayoutContainer>
  );
};

export default Layout;
