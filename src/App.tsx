import { useAuth } from "./context/useAuth";
import { AuthProvider } from "./context/AuthProvider";
import { AuthPage } from "./components/auth/AuthPage";
import { Game } from "./components/Game";

const AppContent = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  const authUser = () => {
    if (user) {
      return {
        id: user.id,
        name: user.firstName,
        email: user.email
      };
    }

    return null;
  }


  // show loading state while checking authentication
  if (isLoading) {
    return (
      <div
        className='app-content-container'
      >
        Loading...
      </div>
    );
  }

  // show auth page if not logged in, otherwise, show game
  return isAuthenticated ? <Game user={authUser()} /> : <AuthPage />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
