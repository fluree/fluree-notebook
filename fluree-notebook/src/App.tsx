import { NotebookShell } from './notebook-shell';
import { GlobalProvider } from './hooks/useGlobal.jsx';
import { useState } from 'react';
import 'react-tippy/dist/tippy.css';

function App() {
  return (
    <GlobalProvider>
      <NotebookShell />
    </GlobalProvider>
  );
}

export default App;
