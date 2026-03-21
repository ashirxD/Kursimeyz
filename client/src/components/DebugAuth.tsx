import { useUser, useIsAdmin, useIsAuthenticated } from "@/stores";

const DebugAuth = () => {
  const user = useUser();
  const isAdmin = useIsAdmin();
  const isAuthenticated = useIsAuthenticated();
  const token = localStorage.getItem("token");

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '1px solid black', 
      padding: '10px',
      zIndex: 9999,
      fontSize: '12px',
      maxWidth: '300px'
    }}>
      <div><strong>Auth Debug:</strong></div>
      <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
      <div>Admin: {isAdmin ? 'Yes' : 'No'}</div>
      <div>Token: {token ? `${token.substring(0, 20)}...` : 'None'}</div>
      <div><strong>User:</strong></div>
      <pre style={{ fontSize: '10px', overflow: 'auto' }}>
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
};

export default DebugAuth;
