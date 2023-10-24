import { useState, useEffect } from 'react';
import { Sidebar } from './components/sidebar.tsx';
import Notebook from './notebook.tsx';
import type { NotebookState, Cell } from './types/index';
import { MainNav } from './components/main-nav.tsx';
import useGlobal from './hooks/useGlobal.tsx';

import useFluree from './flureedb/useFluree';
import { memoryConnOptions } from './flureedb/config';

export const NotebookShell = (): JSX.Element => {
  const {
    conn: fConn,
    ledger,
    stagedDb,
    committedDb,
    stage,
    commit,
    query,
  } = useFluree('test/jld', memoryConnOptions(null));

  const memQuery = async (value, setter) => {
    if (committedDb) {
      if (ledger) {
        const r = await query(committedDb, value);
        if (r) setter(JSON.stringify(r, null, 2));
      }
    }
  };

  const memTransact = async (value, setter) => {
    let newStaged;
    if (value) {
      // staging
      newStaged = await stage(ledger, value);
    }

    if (ledger) {
      const r = await commit(ledger, newStaged ?? stagedDb);
      if (r) {
        setter(
          JSON.stringify(
            { ...r.commit.data, time: r.commit.time },
            circularReplacer(),
            2
          )
        );
      }
    }
  };

  const circularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  };

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
    state: { defaultConn, keyListener },
    dispatch,
  } = useGlobal();

  const updateGlobalKey = (val) => {
    dispatch({ type: 'keyListener', value: val });
  };

  const globalListener = (e) => {
    const listenKeys = ['AltLeft', 'AltRight', 'ShiftLeft', 'ShiftRight'];
    if (e.type == 'keydown') {
      if (listenKeys.includes(e.code)) {
        keyListener[e.code] = true;
        updateGlobalKey(keyListener);
      }
    } else {
      if (listenKeys.includes(e.code)) {
        delete keyListener[e.code];
        updateGlobalKey(keyListener);
      }
    }
  };

  const cleanLocalStorage = () => {
    const allKeys = Object.keys(localStorage);
    const allowedKeys = [
      'datasets',
      'theme',
      'defaultConn',
      'instances',
      'notebookState',
    ];
    allKeys.forEach((key) => {
      if (!allowedKeys.includes(key)) {
        localStorage.removeItem(key);
      }
    });
  };

  useEffect(() => {
    window.addEventListener('keydown', globalListener);
    window.addEventListener('keyup', globalListener);
    cleanLocalStorage();
    return () => {
      window.removeEventListener('keydown', globalListener);
      window.removeEventListener('keyup', globalListener);
    };
  }, []);

  const [state, setState] = useState<NotebookState>(() => {
    //TODO add results with the cells
    const localState = localStorage.getItem('notebookState');
    if (localState) {
      return JSON.parse(localState);
    }
    return { notebooks: [], activeNotebookId: null };
  });

  const defaultFlureeQL = (defaultLedger: string) =>
    JSON.stringify(
      {
        from: defaultLedger ?? 'ledgerName',
        select: { '?s': ['*'] },
        where: [['?s', 'rdf:type', 'rdfs:Class']],
      },
      null,
      2
    );

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
        '[{"id":"init","name":"localhost","url":"http://localhost:58090/fluree","type":"instance"}]'
      );
    }

    if (!localStorage.getItem('datasets')) {
      localStorage.setItem('datasets', '[]');
    }

    if (!localStorage.getItem('defaultConn')) {
      localStorage.setItem(
        'defaultConn',
        '{"id":"init","name":"localhost","url":"http://localhost:58090/fluree","type":"instance"}'
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

    let ledger = null;
    let defConn = JSON.parse(defaultConn);

    if (defConn.type === 'dataset') {
      ledger = defConn.name;
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
              value: `# ${name}`,
              language: 'json',
              type: 'markdown',
              titleCell: true,
            },
            {
              id: Math.random().toString(36).substring(7),
              value: defaultFlureeQL(ledger),
              language: 'json',
              type: 'monaco',
              conn: defaultConn,
            },
          ],
        },
      ],
      activeNotebookId: id,
    }));
  };

  const selectNotebook = (e, id: string) => {
    if (e.target.type !== 'checkbox' && e.target.dataset.role !== 'hitbox') {
      setState((prevState) => ({ ...prevState, activeNotebookId: id }));
    }
  };

  const editNotebook = (id: string, cells: Cell[]) => {
    setState((prevState) => {
      const notebooks = prevState.notebooks.map((notebook) =>
        notebook.id === id ? { ...notebook, cells } : notebook
      );
      return { ...prevState, notebooks };
    });
  };

  const addNotebooks = (array) => {
    let arrayData = JSON.parse(array);
    for (var i = 0; i < arrayData.length; i++) {
      addNotebook(arrayData[i]);
    }
  };

  const addNotebook = (data) => {
    // get local storage
    let localState = JSON.parse(localStorage.getItem('notebookState'));

    let newData = JSON.parse(JSON.stringify(data));
    newData.defaultConn = defaultConn;

    if (!newData.cells[0].titleCell) {
      let titleCell = {
        id: Math.random().toString(36).substring(7),
        value: `# ${newData.name}`,
        language: 'json',
        type: 'markdown',
        titleCell: true,
      };
      newData.cells.splice(0, 0, titleCell);
    }

    for (var i = 0; i < newData.cells.length; i++) {
      newData.cells[i].conn = defaultConn;
    }

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

  function removeTrailingNewline(str) {
    let newVal = str.endsWith('\n') ? str.slice(0, -1) : str;
    return newVal;
  }

  function markdownToJson(markdown) {
    const lines = markdown.split('\n');

    const result = {
      id: Math.random().toString(36).substring(7),
      name: null,
      cells: [],
    };

    let isInsideCodeBlock = false;
    let codeContent = '';
    let language = 'json'; // Default code language
    let currentText = ''; // Accumulates plain text

    for (let line of lines) {
      if (line.startsWith('```')) {
        if (currentText.trim()) {
          result.cells.push({
            id: Math.random().toString(36).substr(2, 6),
            type: 'markdown',
            value: removeTrailingNewline(currentText),
            language: 'json',
            editing: false,
          });
          currentText = '';
        }

        if (isInsideCodeBlock) {
          result.cells.push({
            id: Math.random().toString(36).substr(2, 6),
            type: 'monaco',
            value: removeTrailingNewline(codeContent),
            language: language,
          });
          codeContent = '';
        } else {
          const langMatch = line.match(/```(\w+)/);
          if (langMatch) {
            language = langMatch[1];
          }
        }

        isInsideCodeBlock = !isInsideCodeBlock;
      } else if (isInsideCodeBlock) {
        codeContent += line + '\n';
      } else if (line.startsWith('#')) {
        if (currentText.trim()) {
          result.cells.push({
            id: Math.random().toString(36).substr(2, 6),
            type: 'markdown',
            value: removeTrailingNewline(currentText),
            language: 'json',
            editing: false,
          });
          currentText = '';
        }

        const headerMatch = line.match(/^(#+) (.+)/);
        if (headerMatch) {
          const headerLevel = headerMatch[1].length;
          const headerContent = headerMatch[2];

          // If it's an H1 and name hasn't been set yet, set it
          if (headerLevel === 1 && !result.name) {
            result.name = headerContent;
          }

          //   currentText += line + '\n';
        }
      } else {
        currentText += line + '\n';
      }
    }

    // After looping, if there's still plain text accumulated, add it as a markdown cell
    if (currentText.trim()) {
      result.cells.push({
        id: Math.random().toString(36).substr(2, 6),
        type: 'markdown',
        value: removeTrailingNewline(currentText),
        language: 'json',
        editing: false,
      });
    }

    return result;
  }

  const handleAdmonitions = (cells) => {
    return cells.reduce((newCells, cell) => {
      if (cell.type === 'markdown' && cell.value.includes('<Admonition')) {
        // Split the markdown content to extract Admonition components
        const parts = cell.value.split(/(<Admonition.*?>.*?<\/Admonition>)/gs);
        parts.forEach((part) => {
          if (part.startsWith('<Admonition')) {
            // Extract type and content from Admonition component
            const match = part.match(
              /<Admonition type="(.*?)">(.*?)<\/Admonition>/s
            );
            if (match) {
              const [, admonitionType, content] = match;
              newCells.push({
                id: Math.random().toString(36).substring(7),
                type: 'admonition',
                value: content.trim(),
                language: 'json',
                editing: false,
                admonitionType,
              });
            }
          } else if (part.trim()) {
            newCells.push({
              ...cell,
              value: part.trim(),
            });
          }
        });
      } else {
        newCells.push(cell);
      }
      return newCells;
    }, []);
  };

  const importMarkdown = (data) => {
    // get local storage
    let localState = JSON.parse(localStorage.getItem('notebookState'));

    let newData = markdownToJson(data);
    newData.defaultConn = defaultConn;

    console.log(newData);

    // Handle Admonition components
    newData.cells = handleAdmonitions(newData.cells);

    if (!newData.cells[0].titleCell) {
      let titleCell = {
        id: Math.random().toString(36).substring(7),
        value: `# ${newData.name}`,
        language: 'json',
        type: 'markdown',
        titleCell: true,
      };
      newData.cells.splice(0, 0, titleCell);
    }

    for (var i = 0; i < newData.cells.length; i++) {
      newData.cells[i].conn = defaultConn;
    }

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

    console.log(e.dataTransfer.files);

    // file type is application/json
    // file type is text/markdown

    // var file = e.dataTransfer.files[0],

    for (var i = 0; i < e.dataTransfer.files.length; i++) {
      let thisFile = e.dataTransfer.files[i];
      if (thisFile.type === 'application/json') {
        let reader = new FileReader();
        reader.onload = function (event) {
          addNotebooks(event.target.result);
        };
        reader.readAsText(e.dataTransfer.files[i]);
      } else if (
        thisFile.type === 'text/markdown' ||
        thisFile.name.endsWith('.mdx')
      ) {
        let reader = new FileReader();
        reader.onload = function (event) {
          importMarkdown(event.target.result);
          console.log(event.target.result);
        };
        reader.readAsText(e.dataTransfer.files[i]);
      }
    }

    // reader.readAsText(file);
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
          addNotebooks={addNotebooks}
          markdownToJson={markdownToJson}
          importMarkdown={importMarkdown}
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
              memQuery={memQuery}
              memTransact={memTransact}
            />
          )}
        </div>
      </div>
    </div>
  );
};
