// src/components/AuthToggle.jsx
import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { signInWithGoogle, signInWithApple, logout } from '../authservice';
import { ClipLoader } from "react-spinners";

function AuthToggle() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);


  // Get loader color based on theme saved in localStorage
  const getLoaderColor = () => {
    if (typeof window !== 'undefined') {
      const theme = localStorage.getItem('theme');
      if (theme === 'dark') return '#fff';
      if (theme === 'light') return '#000';
    }
    // Fallback: use black
    return '#000';
  };

  if (loading) {
    return (
      <section className="auth-toggle" aria-label="Authentication">
        <div className="auth-toggle-loading" aria-live="polite" aria-atomic="true">
          <ClipLoader
            id='auth-loader'
            color={getLoaderColor()}
            loading={loading}
            size={50}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="auth-toggle" aria-label="Authentication">
      {user ? (
        <div className="auth-toggle-row" role="region" aria-live="polite" aria-atomic="true">
          <span className="auth-welcome" tabIndex={0} aria-label={`Welcome, ${user.displayName}`}>Welcome, {user.displayName}</span>
          <button
            type="button"
            id="logoutBtn"
            className="auth-btn"
            onClick={logout}
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="auth-btn-row" role="group" aria-label="Sign in options">
          <button
            type="button"
            id="googleSignInBtn"
            className="auth-btn"
            onClick={signInWithGoogle}
            aria-label="Sign in with Google"
          >
            Sign in with Google
          </button>
          <button
            type="button"
            id="appleSignInBtn"
            className="auth-btn"
            onClick={signInWithApple}
            aria-label="Sign in with Apple"
          >
            Sign in with Apple
          </button>
        </div>
      )}
    </section>
  );
}

export default AuthToggle;