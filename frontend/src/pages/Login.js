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

const LinksRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
`;

const StyledLink = styled(Link)`
  font-size: 14px;
  color: ${props => props.theme.colors.primary};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await login(email, password);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      navigate('/');
    }
  };

  return (
    <Page>
      <Card>
        <Logo />

        <TextBlock>
          <Heading>Welcome back</Heading>
          <Subheading>Sign in to your Clarily account</Subheading>
        </TextBlock>

        <Form onSubmit={handleSubmit}>
          <FieldGroup>
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
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </FieldGroup>

          <Button type="submit" disabled={loading || !email || !password}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </Form>

        <LinksRow>
          <StyledLink to="/forgot-password">Forgot your password?</StyledLink>
          <StyledLink to="/signup">Don't have an account? Sign up</StyledLink>
        </LinksRow>
      </Card>
    </Page>
  );
};

export default Login;
