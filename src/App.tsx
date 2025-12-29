import { useAuth } from "./context/useAuth";
import { AuthProvider } from "./context/AuthProvider";
import { AuthPage } from "./components/auth/AuthPage";
import { Game } from "./components/Game";

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

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
  return isAuthenticated ? <Game /> : <AuthPage />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
