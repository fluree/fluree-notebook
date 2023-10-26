import { useState, useEffect } from 'react';
import { GlobalProvider } from './hooks/useGlobal';
import { NotebookShell } from './NotebookShell.js';
import SettingsModal from './components/SettingsModal.js';
import 'react-tippy/dist/tippy.css';

function App() {
  return (
    <GlobalProvider>
      <NotebookShell />
      <SettingsModal />
    </GlobalProvider>
  );
}

export default App;
