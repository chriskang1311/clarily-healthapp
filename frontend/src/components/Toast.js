import React from 'react';
import styled, { keyframes } from 'styled-components';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineInformationCircle, HiOutlineX } from 'react-icons/hi';

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(100%); }
  to   { opacity: 1; transform: translateX(0); }
`;

const BORDER_COLORS = {
  success: '#4CAF50',
  error:   '#E53935',
  info:    '#2D5016',
};

const ToastContainer = styled.div`
  position: fixed;
  top: 88px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
`;

const ToastItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #fff;
  border-left: 4px solid ${props => BORDER_COLORS[props.type] || BORDER_COLORS.info};
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 12px 14px;
  min-width: 280px;
  max-width: 360px;
  animation: ${slideIn} 0.25s ease;
  pointer-events: all;
`;

const IconWrapper = styled.span`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  color: ${props => BORDER_COLORS[props.type] || BORDER_COLORS.info};
  margin-top: 1px;
`;

const Message = styled.p`
  flex: 1;
  margin: 0;
  font-size: 14px;
  color: #333;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: #999;
  display: flex;
  align-items: center;
  transition: color 0.15s;
  &:hover { color: #555; }
`;

const ICONS = {
  success: HiOutlineCheckCircle,
  error:   HiOutlineXCircle,
  info:    HiOutlineInformationCircle,
};

export const ToastContainer_ = ToastContainer;

const Toast = ({ toasts, onRemove }) => {
  return (
    <ToastContainer>
      {toasts.map(toast => {
        const Icon = ICONS[toast.type] || ICONS.info;
        return (
          <ToastItem key={toast.id} type={toast.type}>
            <IconWrapper type={toast.type}>
              <Icon size={18} />
            </IconWrapper>
            <Message>{toast.message}</Message>
            <CloseButton onClick={() => onRemove(toast.id)}>
              <HiOutlineX size={14} />
            </CloseButton>
          </ToastItem>
        );
      })}
    </ToastContainer>
  );
};

export default Toast;
