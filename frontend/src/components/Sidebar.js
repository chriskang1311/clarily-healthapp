import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  HiOutlineHeart,
  HiOutlineUser,
  HiOutlineCurrencyDollar,
  HiOutlineQuestionMarkCircle
} from 'react-icons/hi';

const SidebarContainer = styled.aside`
  width: 240px;
  background-color: ${props => props.theme.colors.background};
  border-right: 1px solid #E0E0E0;
  padding: 24px 0;
  min-height: calc(100vh - 73px);
`;

const NavList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
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

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: HiOutlineHeart, label: 'Health Journeys' },
    { path: '/appointments', icon: HiOutlineUser, label: 'Appointments' },
    { path: '/insurance', icon: HiOutlineCurrencyDollar, label: 'Insurance' },
    { path: '/support', icon: HiOutlineQuestionMarkCircle, label: 'Support' },
  ];

  return (
    <SidebarContainer>
      <NavList>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavItem key={item.path}>
              <NavLink to={item.path} isActive={isActive}>
                <IconWrapper>
                  <Icon size={20} />
                </IconWrapper>
                {item.label}
              </NavLink>
            </NavItem>
          );
        })}
      </NavList>
    </SidebarContainer>
  );
};

export default Sidebar;

