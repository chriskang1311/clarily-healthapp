import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 48px 64px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  animation: ${fadeIn} 0.3s ease;

  @media (max-width: 768px) {
    padding: 24px 20px;
  }
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin: 0;
`;

const Section = styled.div`
  background: #fff;
  border: 1px solid #E0E0E0;
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 540px;

  @media (max-width: 480px) {
    padding: 20px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  margin: 0;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #E0E0E0;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-size: 15px;
  color: #333;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const SaveButton = styled.button`
  align-self: flex-start;
  padding: 10px 24px;
  background-color: ${props => props.theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.88;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmailNote = styled.p`
  font-size: 13px;
  color: #888;
  margin: 0;
`;

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleNameSave = async () => {
    setSavingName(true);
    const { error } = await updateProfile({ data: { display_name: displayName.trim() } });
    setSavingName(false);
    error ? toast.error(error.message) : toast.success('Name updated.');
  };

  const handleEmailSave = async () => {
    if (!newEmail) return;
    setSavingEmail(true);
    const { error } = await updateProfile({ email: newEmail });
    setSavingEmail(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Confirmation sent to both your old and new email.');
      setNewEmail('');
    }
  };

  const handlePasswordSave = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSavingPassword(true);
    const { error } = await updateProfile({ password: newPassword });
    setSavingPassword(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated.');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <MainContent>
      <Title>Profile</Title>

      <Section>
        <SectionTitle>Display Name</SectionTitle>
        <FieldGroup>
          <Label>Name shown in the app</Label>
          <Input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Your name"
            maxLength={80}
          />
        </FieldGroup>
        <SaveButton onClick={handleNameSave} disabled={savingName || !displayName.trim()}>
          {savingName ? 'Saving…' : 'Save Name'}
        </SaveButton>
      </Section>

      <Section>
        <SectionTitle>Change Email</SectionTitle>
        <EmailNote>Current email: <strong>{user?.email}</strong></EmailNote>
        <FieldGroup>
          <Label>New Email</Label>
          <Input
            type="email"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            placeholder="new@example.com"
          />
        </FieldGroup>
        <EmailNote>A confirmation will be sent to both your old and new email address.</EmailNote>
        <SaveButton onClick={handleEmailSave} disabled={savingEmail || !newEmail}>
          {savingEmail ? 'Saving…' : 'Update Email'}
        </SaveButton>
      </Section>

      <Section>
        <SectionTitle>Change Password</SectionTitle>
        <FieldGroup>
          <Label>New Password</Label>
          <Input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        </FieldGroup>
        <FieldGroup>
          <Label>Confirm New Password</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
        </FieldGroup>
        <SaveButton onClick={handlePasswordSave} disabled={savingPassword || !newPassword || !confirmPassword}>
          {savingPassword ? 'Saving…' : 'Update Password'}
        </SaveButton>
      </Section>
    </MainContent>
  );
};

export default Profile;
