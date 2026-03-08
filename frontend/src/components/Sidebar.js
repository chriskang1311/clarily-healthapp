import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  HiOutlineChat,
  HiOutlineHeart,
  HiOutlineUser,
  HiOutlineCurrencyDollar,
  HiOutlineQuestionMarkCircle,
  HiOutlineCog,
  HiOutlineLogout,
} from 'react-icons/hi';
import { useAuth } from '../contexts/AuthContext';

const SidebarContainer = styled.aside`
  width: 240px;
  flex-shrink: 0;
  background-color: ${props => props.theme.colors.background};
  border-right: 1px solid #E0E0E0;
  padding: 24px 0;
  min-height: calc(100vh - 73px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    position: fixed;
    top: 57px;
    left: ${props => props.isOpen ? '0' : '-240px'};
    height: calc(100vh - 57px);
    z-index: 200;
    transition: left 0.28s ease;
    box-shadow: ${props => props.isOpen ? '2px 0 16px rgba(0,0,0,0.15)' : 'none'};
    min-height: unset;
  }
`;

const NavList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const NavItem = styled.li`
  margin: 0 12px;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  border-radius: ${props => props.theme.borderRadius.medium};
  background-color: ${props => props.isActive ? props.theme.colors.primaryLight : 'transparent'};
  font-size: 16px;
  font-weight: ${props => props.isActive ? '600' : '400'};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.isActive ? props.theme.colors.primaryLight : '#F5F5F5'};
  }
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #E0E0E0;
  margin: 8px 12px;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  width: 100%;
  color: #888;
  background: none;
  border: none;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-size: 16px;
  font-weight: 400;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  text-align: left;

  &:hover {
    background-color: #F5F5F5;
    color: #555;
  }
`;

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems = [
    { path: '/chatbot',         icon: HiOutlineChat,              label: 'Symptom Chat' },
    { path: '/health-journeys', icon: HiOutlineHeart,             label: 'Health Journeys' },
    { path: '/appointments',    icon: HiOutlineUser,              label: 'Appointments' },
    { path: '/insurance',       icon: HiOutlineCurrencyDollar,    label: 'Insurance' },
    { path: '/support',         icon: HiOutlineQuestionMarkCircle,label: 'Support' },
    { path: '/profile',         icon: HiOutlineCog,               label: 'Profile' },
  ];

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate('/login');
  };

  return (
    <SidebarContainer isOpen={isOpen}>
      <NavList>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavItem key={item.path}>
              <NavLink to={item.path} isActive={isActive} onClick={onClose}>
                <IconWrapper>
                  <Icon size={20} />
                </IconWrapper>
                {item.label}
              </NavLink>
            </NavItem>
          );
        })}

        <Divider />

        <NavItem>
          <LogoutButton onClick={handleLogout}>
            <IconWrapper>
              <HiOutlineLogout size={20} />
            </IconWrapper>
            Log Out
          </LogoutButton>
        </NavItem>
      </NavList>
    </SidebarContainer>
  );
};

export default Sidebar;
