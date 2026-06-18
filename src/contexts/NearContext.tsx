import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { NearConnector } from "@hot-labs/near-connect";

interface NearContextType {
  connector: NearConnector | null;
  accountId: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const NearContext = createContext<NearContextType | null>(null);

export const NearContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connector = useMemo(() => {
    if (typeof window === "undefined") return null;
    return new NearConnector({
      // Optional: integration with existing WalletConnect project
      // walletConnect: ... 
    });
  }, []);

  useEffect(() => {
    if (!connector) return;

    const handleSignIn = (t: any) => {
      const address = t.accounts[0].accountId;
      setAccountId(address);
      setIsConnected(true);
    };

    const handleSignOut = () => {
      setAccountId(null);
      setIsConnected(false);
    };

    connector.on("wallet:signIn", handleSignIn);
    connector.on("wallet:signOut", handleSignOut);

    // Initial check if already connected
    const checkConnection = async () => {
        try {
            const wallet = await connector.wallet();
            if (wallet) {
                const accounts = await wallet.getAccounts();
                if (accounts && accounts.length > 0) {
                    setAccountId(accounts[0].accountId);
                    setIsConnected(true);
                }
            }
        } catch (e) {
            // Not connected or error
        }
    };

    checkConnection();

    return () => {
      // NearConnector might not have an off method in the basic docs, 
      // but usually libraries like this do. For now, we'll just handle state.
    };
  }, [connector]);

  const connect = useCallback(async () => {
    if (connector) {
      await connector.connect();
    }
  }, [connector]);

  const disconnect = useCallback(async () => {
    if (connector) {
      const wallet = await connector.wallet();
      if (wallet && wallet.signOut) {
        await wallet.signOut();
      }
      setAccountId(null);
      setIsConnected(false);
    }
  }, [connector]);

  return (
    <NearContext.Provider
      value={{
        connector,
        accountId,
        isConnected,
        connect,
        disconnect,
      }}
    >
      {children}
    </NearContext.Provider>
  );
};

export const useNear = () => {
  const context = useContext(NearContext);
  if (!context) {
    throw new Error("useNear must be used within a NearContextProvider");
  }
  return context;
};
