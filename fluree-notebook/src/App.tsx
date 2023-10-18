import { NotebookShell } from './notebook-shell';
import { GlobalProvider } from './hooks/useGlobal';
import { useState } from 'react';
import 'react-tippy/dist/tippy.css';
import SettingsModal from './components/settings-modal.js';

function App() {
  return (
    <GlobalProvider>
      <NotebookShell />
      <SettingsModal />
    </GlobalProvider>
  );
}

export default App;
