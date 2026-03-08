import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  min-height: 100vh;
  background-color: ${props => props.theme.colors.primaryLight};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(45, 80, 22, 0.12);
  padding: 56px 48px;
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  animation: ${fadeUp} 0.4s ease;

  @media (max-width: 480px) {
    padding: 40px 24px;
  }
`;

const TextBlock = styled.div`
  text-align: center;
`;

const Heading = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin: 0 0 10px 0;
`;

const Subheading = styled.p`
  font-size: 16px;
  color: #777;
  margin: 0;
  line-height: 1.5;
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #E0E0E0;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-size: 16px;
  color: #333;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
  }

  &::placeholder {
    color: #bbb;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  background-color: ${props => props.theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-size: 16px;
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

const SuccessBox = styled.div`
  text-align: center;
  padding: 24px;
  background-color: ${props => props.theme.colors.primaryLight};
  border-radius: ${props => props.theme.borderRadius.medium};
  width: 100%;
`;

const SuccessText = styled.p`
  color: ${props => props.theme.colors.primary};
  font-size: 15px;
  margin: 0;
  line-height: 1.6;
`;

const StyledLink = styled(Link)`
  font-size: 14px;
  color: ${props => props.theme.colors.primary};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <Page>
      <Card>
        <Logo />

        <TextBlock>
          <Heading>Reset your password</Heading>
          <Subheading>
            {sent
              ? 'Email sent!'
              : "Enter your email and we'll send you a reset link."}
          </Subheading>
        </TextBlock>

        {sent ? (
          <SuccessBox>
            <SuccessText>
              Check your inbox for a password reset link. Click it to set a new password — it will land you on your profile page.
            </SuccessText>
          </SuccessBox>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
              required
            />
            <Button type="submit" disabled={loading || !email}>
              {loading ? 'Sending…' : 'Send Reset Link'}
            </Button>
          </Form>
        )}

        <StyledLink to="/login">Back to Sign In</StyledLink>
      </Card>
    </Page>
  );
};

export default ForgotPassword;
