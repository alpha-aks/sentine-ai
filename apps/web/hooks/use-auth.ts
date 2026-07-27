import { useAuthStore } from '@/store/auth-store';
import { authService } from '@/services/auth.service';
import { LoginFormData } from '@/utils/validators';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, setAuth, logout: storeLogout } = useAuthStore();

  const login = async (credentials: LoginFormData) => {
    const data = await authService.login(credentials);
    setAuth(data.user, data.accessToken, data.refreshToken);
    const targetRoute = data.user.role === 'CANDIDATE' ? '/candidate' : '/dashboard';
    router.push(targetRoute);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    storeLogout();
    router.push('/login');
  };

  return {
    user,
    isAuthenticated,
    login,
    logout
  };
}
