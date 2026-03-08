import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { HiOutlineUser, HiOutlineBell, HiOutlineMenu } from 'react-icons/hi';
import Logo from './Logo';
import useUserName from '../hooks/useUserName';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

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

  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HamburgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.theme.colors.primary};
  padding: 4px;
  align-items: center;

  @media (max-width: 768px) {
    display: flex;
  }
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

  @media (max-width: 768px) {
    display: none;
  }
`;

const NotificationWrapper = styled(Link)`
  position: relative;
  display: flex;
  align-items: center;
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const BellIcon = styled(HiOutlineBell)`
  width: 22px;
  height: 22px;
  color: ${props => props.theme.colors.primary};
`;

const UnreadBadge = styled.span`
  position: absolute;
  top: -5px;
  right: -6px;
  background-color: #E53935;
  color: white;
  font-size: 10px;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 99px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  line-height: 1;
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

  @media (max-width: 480px) {
    display: none;
  }
`;

const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const userName = useUserName();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    // Poll every 30 seconds so badge stays fresh across navigation
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications`);
      if (res.ok) {
        const data = await res.json();
        const count = (data.notifications || []).filter(n => !n.read).length;
        setUnreadCount(count);
      }
    } catch {
      // Silently ignore — badge is non-critical
    }
  };

  return (
    <HeaderContainer>
      <LeftSection>
        <HamburgerButton onClick={onMenuClick} aria-label="Open menu">
          <HiOutlineMenu size={24} />
        </HamburgerButton>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Logo />
        </Link>
      </LeftSection>
      <RightSection>
        <NavLink to="/" isActive={location.pathname === '/'}>
          Home
        </NavLink>
        <NotificationWrapper to="/notifications">
          <BellIcon />
          {unreadCount > 0 && (
            <UnreadBadge>{unreadCount > 99 ? '99+' : unreadCount}</UnreadBadge>
          )}
        </NotificationWrapper>
        <ProfileSection>
          <UserIcon />
          <UserName>{userName}</UserName>
        </ProfileSection>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;
