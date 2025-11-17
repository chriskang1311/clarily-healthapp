import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { HiOutlineUser } from 'react-icons/hi';
import Logo from './Logo';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background-color: ${props => props.theme.colors.background};
  border-bottom: 1px solid #E0E0E0;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
`;

const RightSection = styled.nav`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const NavLink = styled(Link)`
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  font-size: 16px;
  font-weight: ${props => props.isActive ? '600' : '400'};
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UserIcon = styled(HiOutlineUser)`
  width: 24px;
  height: 24px;
  color: ${props => props.theme.colors.primary};
`;

const UserName = styled.span`
  color: ${props => props.theme.colors.primary};
  font-size: 16px;
`;

const Header = () => {
  const location = useLocation();

  return (
    <HeaderContainer>
      <LeftSection>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Logo />
        </Link>
      </LeftSection>
      <RightSection>
        <NavLink to="/" isActive={location.pathname === '/'}>
          Home
        </NavLink>
        <NavLink to="/notifications" isActive={location.pathname === '/notifications'}>
          Notifications
        </NavLink>
        <ProfileSection>
          <UserIcon />
          <UserName>Alex</UserName>
        </ProfileSection>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;

