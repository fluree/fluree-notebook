import { useState, useEffect } from 'react';
import { Sidebar } from './components/sidebar.tsx';
import Notebook from './notebook.tsx';
import type { NotebookState, Cell } from './types/index';
import { MainNav } from './components/main-nav.tsx';

export const NotebookShell = (): JSX.Element => {
  const createJson = {
    '@id': 'notebook1',
    '@context': { f: 'https://ns.flur.ee/ledger#' },
    'f:defaultContext': {
      id: '@id',
      type: '@type',
      xsd: 'http://www.w3.org/2001/XMLSchema#',
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      sh: 'http://www.w3.org/ns/shacl#',
      schema: 'http://schema.org/',
      skos: 'http://www.w3.org/2008/05/skos#',
      wiki: 'https://www.wikidata.org/wiki/',
      f: 'https://ns.flur.ee/ledger#',
      ex: 'http://example.org/',
    },
    '@graph': [{ message: 'ledger created' }],
  };

  const [state, setState] = useState<NotebookState>(() => {
    //TODO add results with the cells
    const localState = localStorage.getItem('notebookState');
    if (localState) {
      return JSON.parse(localState);
    }
    return { notebooks: [], activeNotebookId: null };
  });

  const getLocalStorage = () => {
    const localState = localStorage.getItem('notebookState');
    if (localState) {
      setState(JSON.parse(localState));
    } else {
      setState({ notebooks: [], activeNotebookId: null });
    }
  };

  useEffect(() => {
    window.addEventListener('storage', getLocalStorage);
    return () => {
      window.removeEventListener('storage', getLocalStorage);
    };
  }, []);

  useEffect(() => {
    // TODO: remove results before storing to localStorage
    localStorage.setItem('notebookState', JSON.stringify(state));
  }, [state]);

  const addNewNotebook = () => {
    const id = Math.random().toString(36).substring(7); // generate a unique id
    let existingTabs = localStorage.getItem('notebookState');
    existingTabs = JSON.parse(existingTabs);
    existingTabs = existingTabs.notebooks;

    let tabNames = existingTabs.map((tab) => tab.name);
    let newName = '';
    for (var i = 1; i <= tabNames.length + 1; i++) {
      if (tabNames.indexOf(`notebook${i}`) === -1) {
        newName = `notebook${i}`;
        break;
      }
    }

    let name = newName;

    setState((prevState) => ({
      ...prevState,
      notebooks: [
        ...prevState.notebooks,
        {
          id,
          name,
          cells: [
            {
              value: JSON.stringify(createJson, null, 2),
              language: 'json',
              type: 'monaco',
              createCell: true,
            },
          ],
        },
      ],
      activeNotebookId: id,
    }));
  };

  const selectNotebook = (id: string) => {
    setState((prevState) => ({ ...prevState, activeNotebookId: id }));
  };

  const editNotebook = (id: string, cells: Cell[]) => {
    setState((prevState) => {
      const notebooks = prevState.notebooks.map((notebook) =>
        notebook.id === id ? { ...notebook, cells } : notebook
      );
      return { ...prevState, notebooks };
    });
  };

  return (
    <div className="dark:bg-ui-neutral-900">
      <MainNav />
      <div className="flex">
        <Sidebar
          notebooks={state.notebooks}
          selectedNotebook={state.activeNotebookId || ''}
          onSelectNotebook={selectNotebook}
          addNotebook={addNewNotebook}
        />
        <div className="w-[calc(100%)] bg-white dark:bg-ui-neutral-900 py-4 pl-5 rounded-lg">
          {state.activeNotebookId && (
            <Notebook
              id={state.activeNotebookId}
              key={state.activeNotebookId}
              storedCells={
                state.notebooks.find((n) => n.id === state.activeNotebookId)
                  ?.cells
              }
              onCellsChange={(cells: Cell[]) =>
                editNotebook(state.activeNotebookId as string, cells)
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};
