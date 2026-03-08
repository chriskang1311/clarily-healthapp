const useUserName = () => {
  return localStorage.getItem('clarily-user-name') || 'User';
};

export default useUserName;
