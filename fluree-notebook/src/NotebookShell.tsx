import { useState, useEffect, KeyboardEvent, DragEvent } from 'react';
import { MainNav } from './components/MainNav.tsx';
import Sidebar from './components/Sidebar.tsx';
import Notebook from './Notebook.tsx';
import useGlobal from './hooks/useGlobal.tsx';

import type {
  NotebookState,
  Cell,
  Notebook as NotebookType,
  Conn,
} from './types/index';

// @ts-ignore
import useFluree from './flureedb/useFluree.js';
// @ts-ignore
import { memoryConnOptions } from './flureedb/config.js';

interface PostmanRequest {
  name: string;
  request: {
    method: string;
    url: {
      raw: string;
    };
    // Add other properties as needed
  };
  // Add other properties as needed
}

export const NotebookShell = (): JSX.Element => {
  const { ledger, stagedDb, committedDb, stage, commit, query } = useFluree(
    'test/jld',
    memoryConnOptions(null)
  );

  const memQuery = async (value: string, setter: any) => {
    if (committedDb) {
      if (ledger) {
        const r = await query(committedDb, value);
        if (r) setter(JSON.stringify(r, null, 2));
      }
    }
  };

  const memTransact = async (value: string, setter: any) => {
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
    return (key: any, value: any) => {
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

  const updateGlobalKey = (val: any) => {
    console.log('was called...');
    dispatch({ type: 'keyListener', value: val });
  };

  //   useEffect(() => {
  //     console.log(keyListener);
  //   }, [keyListener]);

  const globalListener = (e: KeyboardEvent) => {
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
      'admin',
    ];
    allKeys.forEach((key) => {
      if (!allowedKeys.includes(key)) {
        localStorage.removeItem(key);
      }
    });
  };

  useEffect(() => {
    // @ts-ignore
    window.addEventListener('keydown', globalListener);
    // @ts-ignore
    window.addEventListener('keyup', globalListener);
    cleanLocalStorage();
    return () => {
      // @ts-ignore
      window.removeEventListener('keydown', globalListener);
      // @ts-ignore
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
    let localState = JSON.parse(localStorage.getItem('notebookState') || '[]');
    let notebooks = localState.notebooks;

    let names = notebooks.map((notebook: NotebookType) => notebook.name);
    let name = '';
    for (var i = 1; i <= names.length + 1; i++) {
      if (names.indexOf(`notebook${i}`) === -1) {
        name = `notebook${i}`;
        break;
      }
    }

    let ledger: string;
    let defConn: Conn = JSON.parse(defaultConn);

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

  const selectNotebook = (e: any, id: string) => {
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

  const addNotebooks = (stringifiedArray: any) => {
    let arrayData = JSON.parse(stringifiedArray);
    for (var i = 0; i < arrayData.length; i++) {
      addNotebook(arrayData[i]);
    }
  };

  const addNotebook = (stringifiedData: string) => {
    // get local storage
    let localState = JSON.parse(localStorage.getItem('notebookState') || '[]');

    let newData = JSON.parse(JSON.stringify(stringifiedData));
    if (typeof newData === 'string') {
      newData = JSON.parse(newData);
    }
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
      if (newData.cells[i].type === 'monaco') {
        newData.cells[i].conn = defaultConn;
      }
    }

    let existingNotebook = localState.notebooks.findIndex(
      (obj: NotebookType) => obj.id === newData.id
    );

    if (existingNotebook > -1) {
      if (confirm(`Replace existing notebook? (id: ${newData.id})`) === true) {
        localState.notebooks.splice(existingNotebook, 1, newData);
        localState.activeNotebookId = newData.id;
      } else {
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

  function removeTrailingNewline(str: string) {
    let newVal = str.endsWith('\n') ? str.slice(0, -1) : str;
    return newVal;
  }

  const convertPostmanToCells = (postmanCollection: any) => {
    const cells: Cell[] = [];
    const name = postmanCollection.info.name;
    const postmanId = postmanCollection.info['_postman_id'];

    const addItem = (item: PostmanRequest) => {
      const { name, request } = item;
      const { method, url, header } = request;

      let language;
      if (header[0].value === 'application/sparql-query') {
        language = 'sparql';
      } else {
        language = 'json';
      }

      const markdownValue = `### ${name}\n\n- **Method:** ${method}\n- **URL:** ${url.raw}\n`;
      // @ts-ignore
      cells.push({ type: 'markdown', value: markdownValue });

      let requestBody;
      if (language === 'json') {
        try {
          // @ts-ignore
          requestBody = JSON.stringify(JSON.parse(request.body.raw), null, 2);
        } catch (e) {
          console.warn(e);
          // @ts-ignore
          requestBody = request?.body?.raw;
        }
      } else {
        requestBody = request?.body?.raw;
      }

      // @ts-ignore
      cells.push({ type: 'monaco', value: requestBody, language });
    };

    const parseItems = (items: any[]) => {
      for (const item of items) {
        if (item.item) {
          parseItems(item.item);
        } else {
          addItem(item);
        }
      }
    };

    parseItems(postmanCollection.item);
    let newNotebook = {
      id: postmanId,
      name: name,
      defaultConn: defaultConn,
      cells: cells,
    };

    // return cells;
    return newNotebook;
  };

  const markdownToJson = (markdown: string) => {
    const lines = markdown.split('\n');

    const result: NotebookType = {
      id: Math.random().toString(36).substring(7),
      name: '',
      cells: [],
    };

    let isInsideCodeBlock = false;
    let codeContent = '';
    let language: 'json' | 'sparql' = 'json'; // Default code language
    let currentText = ''; // Accumulates plain text

    for (let line of lines) {
      if (line.startsWith('```')) {
        if (currentText.trim()) {
          // @ts-ignore
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
          // @ts-ignore
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
            if (langMatch[1] === 'json' || langMatch[1] === 'sparql') {
              language = langMatch[1];
            }
          }
        }

        isInsideCodeBlock = !isInsideCodeBlock;
      } else if (isInsideCodeBlock) {
        codeContent += line + '\n';
      } else if (line.startsWith('#')) {
        if (currentText.trim()) {
          // @ts-ignore
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
            continue;
          }

          currentText += line + '\n';
        }
      } else {
        currentText += line + '\n';
      }
    }

    // After looping, if there's still plain text accumulated, add it as a markdown cell
    if (currentText.trim()) {
      result?.cells?.push({
        id: Math.random().toString(36).substr(2, 6),
        type: 'markdown',
        value: removeTrailingNewline(currentText),
        language: 'json',
        editing: false,
      });
    }

    return result;
  };

  const handleAdmonitions = (cells: Array<Cell>) => {
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
              // @ts-ignore
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
            // @ts-ignore
            newCells.push({
              ...cell,
              value: part.trim(),
            });
          }
        });
      } else {
        // @ts-ignore
        newCells.push(cell);
      }
      return newCells;
    }, []);
  };

  const handleMermaids = (cells: Array<Cell>) => {
    return cells.reduce((newCells, cell) => {
      if (cell.type === 'markdown' && cell.value.includes('<FlureeMermaid')) {
        // Split the markdown content to extract FlureeMermaid components
        const parts = cell.value.split(/(<FlureeMermaid.*?\/>)/s);
        parts.forEach((part) => {
          if (part.startsWith('<FlureeMermaid')) {
            // Extract chart content from FlureeMermaid component
            const match = part.match(
              /<FlureeMermaid\s+chart={`([\s\S]*?)`}\s*\/>/
            );
            if (match) {
              const [, chartContent] = match;
              // @ts-ignore
              newCells.push({
                id: Math.random().toString(36).substring(7),
                type: 'mermaid',
                value: chartContent.trim(),
                language: 'json',
                editing: false,
              });
            }
          } else if (part.trim()) {
            // @ts-ignore
            newCells.push({
              ...cell,
              value: part.trim(),
            });
          }
        });
      } else {
        // @ts-ignore
        newCells.push(cell);
      }
      return newCells;
    }, []);
  };

  const importMarkdown = (data: any) => {
    // get local storage
    let localState = JSON.parse(localStorage.getItem('notebookState') || '[]');

    let newData = markdownToJson(data);
    newData.defaultConn = defaultConn;

    // Handle Admonition components
    if (newData.cells) {
      newData.cells = handleAdmonitions(newData.cells);
      newData.cells = handleMermaids(newData.cells);

      if (!newData.cells[0].titleCell) {
        let titleCell = {
          id: Math.random().toString(36).substring(7),
          value: `# ${newData.name}`,
          language: 'json',
          type: 'markdown',
          titleCell: true,
        };
        // @ts-ignore
        newData.cells.splice(0, 0, titleCell);
      }

      for (var i = 0; i < newData.cells.length; i++) {
        newData.cells[i].conn = defaultConn;
      }

      // if ID already exists...
      let existingNotebook = localState.notebooks.findIndex(
        (obj: Notebook) => obj.id === newData.id
      );

      if (existingNotebook > -1) {
        if (
          confirm(`Replace existing notebook? (id: ${newData.id})`) === true
        ) {
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
    }
  };

  const allowDrop = (e: DragEvent) => {
    e.preventDefault();
  };

  const drop = (e: DragEvent) => {
    e.preventDefault();
    for (const thisFile of e.dataTransfer.files) {
      if (thisFile.type === 'application/json') {
        let reader = new FileReader();
        reader.onload = function (event) {
          if (event.target) {
            // @ts-ignore
            let parsed = JSON.parse(event.target.result);
            if (parsed.info && parsed.info['_postman_id']) {
              // @ts-ignore
              let data = convertPostmanToCells(JSON.parse(event.target.result));
              addNotebook(JSON.stringify(data));
            }
            addNotebooks(event.target.result);
          }
        };
        reader.readAsText(thisFile);
      } else if (
        thisFile.type === 'text/markdown' ||
        thisFile.name.endsWith('.mdx')
      ) {
        let reader = new FileReader();
        reader.onload = function (event) {
          if (event.target) {
            importMarkdown(event.target.result);
          }
        };
        reader.readAsText(thisFile);
      }
    }
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
          importMarkdown={importMarkdown}
        />
        <div className="w-[calc(100%)] bg-white dark:bg-ui-neutral-900 py-4 pl-5 rounded-lg">
          {state.activeNotebookId && (
            <Notebook
              id={state.activeNotebookId}
              key={state.activeNotebookId}
              storedCells={
                state.notebooks.find((n) => n.id === state.activeNotebookId)
                  ?.cells || []
              }
              defaultConn={
                state.notebooks.find((n) => n.id === state.activeNotebookId)
                  ?.defaultConn || defaultConn
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
