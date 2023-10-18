import { useState, useEffect } from 'react';
import { Sidebar } from './components/sidebar.tsx';
import Notebook from './notebook.tsx';
import type { NotebookState, Cell } from './types/index';
import { MainNav } from './components/main-nav.tsx';
import useGlobal from './hooks/useGlobal.tsx';

export const NotebookShell = (): JSX.Element => {
  const createJson = {
    'f:ledger': 'notebookExample',
    '@context': {
      f: 'https://ns.flur.ee/ledger#',
    },
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
    '@graph': [
      {
        message: 'ledger created',
      },
    ],
  };

  const {
    state: { defaultConn },
  } = useGlobal();

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
    if (!localStorage.getItem('instances')) {
      localStorage.setItem(
        'instances',
        '[{"name":"localhost","url":"http://localhost:58090/fluree","type":"instance"}]'
      );
    }

    if (!localStorage.getItem('datasets')) {
      localStorage.setItem('datasets', '[]');
    }

    if (!localStorage.getItem('defaultConn')) {
      localStorage.setItem(
        'defaultConn',
        '{"name":"localhost","url":"http://localhost:58090/fluree","type":"instance"}'
      );
    }

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
    let localState = JSON.parse(localStorage.getItem('notebookState'));
    let notebooks = localState.notebooks;

    let names = notebooks.map((notebook) => notebook.name);
    let name = '';
    for (var i = 1; i <= names.length + 1; i++) {
      if (names.indexOf(`notebook${i}`) === -1) {
        name = `notebook${i}`;
        break;
      }
    }

    setState((prevState) => ({
      ...prevState,
      notebooks: [
        ...prevState.notebooks,
        {
          id,
          name,
          defaultConn,
          cells: [
            {
              id: Math.random().toString(36).substring(7),
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

  const addNotebook = (data) => {
    // get local storage
    let localState = JSON.parse(localStorage.getItem('notebookState'));

    let newData = JSON.parse(data);

    // if ID already exists...
    let existingNotebook = localState.notebooks.findIndex(
      (obj) => obj.id === newData.id
    );

    if (existingNotebook > -1) {
      if (confirm(`Replace existing notebook? (id: ${newData.id})`) === true) {
        // replace existing...
        localState.notebooks.splice(existingNotebook, 1, newData);
        localState.activeNotebookId = newData.id;
      } else {
        // assign new id
        newData.id = Math.random().toString(36).substring(7);
        localState.notebooks.push(newData);
        localState.activeNotebookId = newData.id;
      }
    } else {
      localState.notebooks.push(newData);
      localState.activeNotebookId = newData.id;
    }
    localStorage.setItem('notebookState', JSON.stringify(localState));
    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
    }, 500);
  };

  const allowDrop = (e) => {
    e.preventDefault();
  };

  const drop = (e) => {
    e.preventDefault();

    var file = e.dataTransfer.files[0],
      reader = new FileReader();

    reader.onload = function (event) {
      addNotebook(event.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="dark:bg-ui-neutral-900 relative"
      onDragOver={allowDrop}
      onDrop={drop}
    >
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
              defaultConn={
                state.notebooks.find((n) => n.id === state.activeNotebookId)
                  ?.defaultConn
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
