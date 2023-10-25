import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface GlobalState {
  theme: string | null;
  settingsOpen: boolean;
  keyListener: Record<string, unknown>;
  lastNotebookSelected: null;
  lastNotebookSelectedState: boolean;
  defaultConn: string;
}

const initialState: GlobalState = {
  theme: localStorage.getItem('theme'),
  settingsOpen: false,
  keyListener: {},
  lastNotebookSelected: null,
  lastNotebookSelectedState: false,
  defaultConn:
    localStorage.getItem('defaultConn') ??
    '{"id":"init","name":"localhost","url":"http://localhost:58090/fluree","type":"instance"}',
};

interface GlobalAction {
  type: string;
  value: any;
}

const GlobalContext = createContext<
  { state: GlobalState; dispatch: React.Dispatch<GlobalAction> } | undefined
>(undefined);

function globalReducer(state: GlobalState, action: GlobalAction): GlobalState {
  return { ...state, [action.type]: action.value };
}

interface GlobalProviderProps {
  children: ReactNode;
}

function GlobalProvider({ children }: GlobalProviderProps) {
  const [state, dispatch] = useReducer(globalReducer, initialState);
  const context = { state, dispatch };
  return (
    <GlobalContext.Provider value={context}>{children}</GlobalContext.Provider>
  );
}

function useGlobal() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
}

export { GlobalProvider, useGlobal as default };
