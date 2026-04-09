import { useEffect, useRef } from 'react';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before logout

export const useSessionManager = (user, onLogout, onWarning) => {
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  const resetSession = () => {
    lastActivityRef.current = Date.now();
    
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    warningTimeoutRef.current = setTimeout(() => {
      onWarning?.();
    }, SESSION_TIMEOUT - WARNING_TIME);

    timeoutRef.current = setTimeout(() => {
      onLogout?.();
    }, SESSION_TIMEOUT);
  };

  useEffect(() => {
    if (!user) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      return;
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetSession();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    resetSession();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [user, onLogout, onWarning]);
};
