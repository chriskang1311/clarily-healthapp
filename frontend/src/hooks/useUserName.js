import { useAuth } from '../contexts/AuthContext';

const useUserName = () => {
  const { user } = useAuth();
  return user?.user_metadata?.display_name || 'User';
};

export default useUserName;
