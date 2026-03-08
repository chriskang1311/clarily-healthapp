import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import styled, { keyframes } from 'styled-components';
import {
  HiOutlineBell,
  HiOutlineCheck,
  HiOutlineHeart,
  HiOutlineCalendar,
  HiOutlineInformationCircle,
} from 'react-icons/hi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 48px 64px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  animation: ${fadeIn} 0.3s ease;

  @media (max-width: 768px) {
    padding: 24px 20px;
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin: 0;
`;

const MarkAllButton = styled.button`
  background: none;
  border: 1px solid #D0D0D0;
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.15s;

  &:hover {
    background-color: ${props => props.theme.colors.primaryLight};
  }
`;

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const NotificationItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 20px;
  border-radius: ${props => props.theme.borderRadius.medium};
  background-color: ${props => props.unread ? props.theme.colors.primaryLight : 'transparent'};
  cursor: pointer;
  transition: background-color 0.15s;

  &:hover {
    background-color: ${props => props.unread ? '#D8EDD8' : '#F5F5F5'};
  }
`;

const IconCircle = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: ${props =>
    props.type === 'journey' ? '#E8F5E9' :
    props.type === 'appointment' ? '#E3F2FD' :
    '#F5F5F5'};
  color: ${props =>
    props.type === 'journey' ? '#2E7D32' :
    props.type === 'appointment' ? '#1565C0' :
    '#757575'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const NotificationContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const NotificationMessage = styled.p`
  font-size: 15px;
  font-weight: ${props => props.unread ? '600' : '400'};
  color: ${props => props.unread ? props.theme.colors.primary : '#444'};
  margin: 0;
  line-height: 1.4;
`;

const NotificationTime = styled.span`
  font-size: 12px;
  color: #AAA;
`;

const UnreadDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.primary};
  flex-shrink: 0;
  margin-top: 6px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 64px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  border: 1px dashed #D0D0D0;
  border-radius: ${props => props.theme.borderRadius.large};
`;

const EmptyTitle = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  margin: 0;
`;

const EmptyText = styled.p`
  font-size: 15px;
  color: #999;
  margin: 0;
`;

// ─────────────────────────────────────────────────────────────────────────────

function typeIcon(type) {
  if (type === 'journey') return <HiOutlineHeart size={18} />;
  if (type === 'appointment') return <HiOutlineCalendar size={18} />;
  return <HiOutlineInformationCircle size={18} />;
}

function relativeTime(isoStr) {
  if (!isoStr) return '';
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const Notifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      toast.error('Failed to load notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      const res = await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PUT' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error('Error marking notification read:', err);
      toast.error('Failed to mark notification as read.');
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications/read-all`, { method: 'PUT' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Error marking all read:', err);
      toast.error('Failed to mark all notifications as read.');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <MainContent>
      <PageHeader>
        <Title>
          Notifications
          {unreadCount > 0 && (
            <span style={{ fontSize: 16, fontWeight: 400, color: '#888', marginLeft: 10 }}>
              {unreadCount} unread
            </span>
          )}
        </Title>
        {unreadCount > 0 && (
          <MarkAllButton onClick={markAllRead}>
            <HiOutlineCheck size={15} />
            Mark all as read
          </MarkAllButton>
        )}
      </PageHeader>

      {isLoading ? (
        <p style={{ color: '#888' }}>Loading notifications...</p>
      ) : notifications.length > 0 ? (
        <NotificationList>
          {notifications.map(n => (
            <NotificationItem key={n.id} unread={!n.read} onClick={() => !n.read && markRead(n.id)}>
              <IconCircle type={n.type}>{typeIcon(n.type)}</IconCircle>
              <NotificationContent>
                <NotificationMessage unread={!n.read}>{n.message}</NotificationMessage>
                <NotificationTime>{relativeTime(n.created_at)}</NotificationTime>
              </NotificationContent>
              {!n.read && <UnreadDot />}
            </NotificationItem>
          ))}
        </NotificationList>
      ) : (
        <EmptyState>
          <HiOutlineBell size={36} color="#CCC" />
          <EmptyTitle>All caught up!</EmptyTitle>
          <EmptyText>Notifications will appear here when journeys are created or appointments are booked.</EmptyText>
        </EmptyState>
      )}
    </MainContent>
  );
};

export default Notifications;
