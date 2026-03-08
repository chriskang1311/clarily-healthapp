import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  margin-top: 4px;

  &:hover:not(:disabled) {
    opacity: 0.88;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Notice = styled.p`
  font-size: 13px;
  color: #888;
  text-align: center;
  margin: 0;
  line-height: 1.5;
`;

const StyledLink = styled(Link)`
  font-size: 14px;
  color: ${props => props.theme.colors.primary};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error } = await signup(email, password, name.trim());
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created! Check your email to confirm before signing in.');
      navigate('/login');
    }
  };

  const isValid = name.trim() && email && password && confirm;

  return (
    <Page>
      <Card>
        <Logo />

        <TextBlock>
          <Heading>Create your account</Heading>
          <Subheading>Join Clarily to start tracking your health journey</Subheading>
        </TextBlock>

        <Form onSubmit={handleSubmit}>
          <FieldGroup>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g. Alex Johnson"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              maxLength={80}
              required
            />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
          </FieldGroup>

          <Button type="submit" disabled={loading || !isValid}>
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>
        </Form>

        <Notice>
          You'll receive a confirmation email. Please verify your email before signing in.
        </Notice>

        <StyledLink to="/login">Already have an account? Sign in</StyledLink>
      </Card>
    </Page>
  );
};

export default Signup;
