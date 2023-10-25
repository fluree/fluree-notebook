import { useState, useEffect } from 'react';
import { GlobalProvider } from './hooks/useGlobal';
import { NotebookShell } from './notebook-shell';
import SettingsModal from './components/settings-modal.js';
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
