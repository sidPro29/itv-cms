import { Navigate } from 'react-router-dom';
import { getUserRole } from '../utils/auth';

const PrivateRoute = ({ isAuthenticated, children }) => {
  const role = getUserRole();
  const isAdmin = role === 'admin' || role === 'superAdmin';

  if (!isAuthenticated || !isAdmin) {
    if (localStorage.getItem('token') && !isAdmin) {
      localStorage.removeItem('token');
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;

