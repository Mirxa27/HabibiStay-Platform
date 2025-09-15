import React, { createContext, useContext, useState, useEffect } from 'react';

interface SetupStatus {
  setup_complete: boolean;
  needs_setup: boolean;
}

interface SetupContextType {
  setupStatus: SetupStatus | null;
  loading: boolean;
  error: string | null;
  checkSetupStatus: () => Promise<void>;
}

const SetupContext = createContext<SetupContextType | undefined>(undefined);

export function SetupProvider({ children }: { children: React.ReactNode }) {
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSetupStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/setup/status');
      const result = await response.json();
      
      if (result.success) {
        setSetupStatus(result.data);
      } else {
        setError(result.error || 'Failed to check setup status');
      }
    } catch (err) {
      setError('Network error checking setup status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const value: SetupContextType = {
    setupStatus,
    loading,
    error,
    checkSetupStatus,
  };

  return (
    <SetupContext.Provider value={value}>
      {children}
    </SetupContext.Provider>
  );
}

export function useSetup() {
  const context = useContext(SetupContext);
  if (context === undefined) {
    throw new Error('useSetup must be used within a SetupProvider');
  }
  return context;
}