import { useEffect } from 'react';
import type { Cell, NotebookProps, Notebook, Conn } from './types/index';
import useGlobal from './hooks/useGlobal.tsx';

import QueryCell from './components/QueryCell.tsx';
import MarkdownCell from './components/MarkdownCell.tsx';
import MermaidCell from './components/MermaidCell.tsx';
import AdmonitionCell from './components/AdmonitionCell.tsx';
import AddCell from './components/buttons/AddCell.tsx';

interface CellProps {
  id: string;
  type: 'markdown' | 'monaco' | 'mermaid' | 'admonition';
  value: string;
  result?: string;
  resultStatus?: 'success' | 'error' | 'warn' | null;
  index: number;
  revert?: string;
  defaultConn: string;
  language?: 'json' | 'sparql';
  titleCell: boolean;
  admonitionType: 'note' | 'info' | 'tip' | 'caution';
  editing?: boolean;
  conn?: string;
  addCell: (
    cellType: 'Markdown' | 'Mermaid' | 'SPARQL' | 'FLUREEQL' | 'Admonition',
    defaultLedger: string,
    conn?: string,
    index?: number
  ) => void;
  moveCell: (direction: string, index: number) => void;
  duplicateCell: (index: number) => void;
  deleteCell: (index: number) => void;
  clearResult: (index: number) => void;
  onChange: (value: string) => void;
  onDelete: () => void;
  memTransact: (val: string, setter: any) => Promise<void>;
  memQuery: (val: string, setter: any) => Promise<void>;
}

const duplicateCell = (index: number) => {
  // get local storage
  let localState = JSON.parse(localStorage.getItem('notebookState') || '[]');

  // get active notebook, index
  let activeNotebookId = localState.activeNotebookId;
  let activeNotebookIndex = localState.notebooks.findIndex(
    (obj: Notebook) => obj.id === activeNotebookId
  );
  let activeNotebook = localState.notebooks.find(
    (obj: Notebook) => obj.id === activeNotebookId
  );

  // cells of active notebook; remove cell
  let activeNotebookCells = activeNotebook.cells;

  const newCell = JSON.parse(JSON.stringify(activeNotebookCells[index]));
  newCell.id = `f${Math.random().toString(36).substring(2, 11)}`;

  if (newCell.result) {
    delete newCell.result;
  }

  if (newCell.resultStatus) {
    delete newCell.resultStatus;
  }

  activeNotebookCells.splice(index + 1, 0, newCell);

  // set cells of active notebook
  activeNotebook.cells = activeNotebookCells;

  // move changed item back into main object; set local storage
  localState.notebooks[activeNotebookIndex] = activeNotebook;
  localStorage.setItem('notebookState', JSON.stringify(localState));
  window.dispatchEvent(new Event('storage'));
};

const moveCell = (direction: 'up' | 'down', index: number) => {
  // get local storage
  let localState = JSON.parse(localStorage.getItem('notebookState') || '[]');

  // get active notebook, index
  let activeNotebookId = localState.activeNotebookId;
  let activeNotebookIndex = localState.notebooks.findIndex(
    (obj: Notebook) => obj.id === activeNotebookId
  );
  let activeNotebook = localState.notebooks.find(
    (obj: Notebook) => obj.id === activeNotebookId
  );

  // cells of active notebook; remove cell
  let activeNotebookCells = activeNotebook.cells;

  let newIndex: number = index;
  if (direction === 'down') {
    newIndex++;
    newIndex = Math.min(...[newIndex, activeNotebookCells.length - 1]);
  } else if (direction === 'up') {
    newIndex--;
    newIndex = Math.max(...[newIndex, 1]);
  }

  const itemToMove = activeNotebookCells.splice(index, 1)[0];
  activeNotebookCells.splice(newIndex, 0, itemToMove);

  // set cells of active notebook
  activeNotebook.cells = activeNotebookCells;

  // move changed item back into main object; set local storage
  localState.notebooks[activeNotebookIndex] = activeNotebook;
  localStorage.setItem('notebookState', JSON.stringify(localState));
  window.dispatchEvent(new Event('storage'));
};

const deleteCell = (index: number) => {
  // get local storage
  let localState = JSON.parse(localStorage.getItem('notebookState') || '[]');

  // get active notebook, index
  let activeNotebookId = localState.activeNotebookId;
  let activeNotebookIndex = localState.notebooks.findIndex(
    (obj: Notebook) => obj.id === activeNotebookId
  );
  let activeNotebook = localState.notebooks.find(
    (obj: Notebook) => obj.id === activeNotebookId
  );

  // cells of active notebook; remove cell
  let activeNotebookCells = activeNotebook.cells;
  activeNotebookCells.splice(index, 1);

  // set cells of active notebook
  activeNotebook.cells = activeNotebookCells;

  // if all cells are same, update notebook default
  const seen = new Set();
  const result = [];

  for (const item of activeNotebook.cells) {
    if (!seen.has(item.conn) && item.conn !== undefined) {
      seen.add(item.conn);
      result.push(item.conn);
    }
  }

  if (result.length === 1) {
    activeNotebook.defaultConn = result[0];
  }

  // move changed item back into main object; set local storage
  localState.notebooks[activeNotebookIndex] = activeNotebook;
  localStorage.setItem('notebookState', JSON.stringify(localState));
  window.dispatchEvent(new Event('storage'));
};

const clearResult = (index: number) => {
  // get local storage
  let localState = JSON.parse(localStorage.getItem('notebookState') || '[]');

  // get active notebook, index
  let activeNotebookId = localState.activeNotebookId;
  let activeNotebookIndex = localState.notebooks.findIndex(
    (obj: Notebook) => obj.id === activeNotebookId
  );
  let activeNotebook = localState.notebooks.find(
    (obj: Notebook) => obj.id === activeNotebookId
  );

  // cells of active notebook; remove cell
  // activeNotebookCells.splice(index, 1);
  delete activeNotebook.cells[index].result;
  delete activeNotebook.cells[index].resultStatus;

  // move changed item back into main object; set local storage
  localState.notebooks[activeNotebookIndex] = activeNotebook;
  localStorage.setItem('notebookState', JSON.stringify(localState));
  window.dispatchEvent(new Event('storage'));
};

const defaultMarkdown = '## New Markdown Cell\n Double-click to toggle editing';
const defaultSPARQL = (defaultLedger: string) =>
  `SELECT ?s 
  FROM <${defaultLedger ?? 'notebook1'}>
WHERE {
  ?s <type> rdfs:Class
}`;

const defaultFlureeQL = (defaultLedger: string) =>
  JSON.stringify(
    {
      from: defaultLedger ?? 'ledgerName',
      select: { '?s': ['*'] },
      where: [['?s', '@type', 'ex:Yeti']],
    },
    null,
    2
  );

const defaultAdmonition = 'this is an admonition cell';

const addCell = (
  cellType: 'Markdown' | 'Mermaid' | 'SPARQL' | 'FLUREEQL' | 'Admonition',
  defaultLedger: string = 'ledgerName',
  conn?: string,
  index?: number
) => {
  let newVal: string = '';
  let language: 'json' | 'sparql' = 'json';
  let type: 'monaco' | 'mermaid' | 'markdown' | 'admonition' = 'monaco';

  switch (cellType) {
    case 'FLUREEQL':
      newVal = defaultFlureeQL(defaultLedger);
      break;
    case 'SPARQL':
      language = 'sparql';
      newVal = defaultSPARQL(defaultLedger);
      break;
    case 'Markdown':
      type = 'markdown';
      newVal = defaultMarkdown;
      break;
    case 'Mermaid':
      type = 'mermaid';
      newVal = `graph LR
  node1 -->|relation| e((node2)):::lightGreen
  classDef lightGreen fill:lightGreen`;
      break;
    case 'Admonition':
      type = 'admonition';
      newVal = defaultAdmonition;
      break;
    default:
      newVal = 'test';
  }

  const id = `f${Math.random().toString(36).substring(2, 11)}`;
  let newCell: Cell = {
    id,
    type,
    conn,
    value: newVal,
    language,
  };

  if (['Mermaid', 'Markdown', 'Admonition'].includes(cellType)) {
    newCell.editing = true;
    delete newCell.conn;
  }

  if (cellType === 'Admonition') {
    newCell.admonitionType = 'info';
  }

  // get local storage
  let localState = JSON.parse(localStorage.getItem('notebookState') || '[]');

  // get active notebook, index
  let activeNotebookId = localState.activeNotebookId;
  let activeNotebookIndex = localState.notebooks.findIndex(
    (obj: Notebook) => obj.id === activeNotebookId
  );
  let activeNotebook = localState.notebooks.find(
    (obj: Notebook) => obj.id === activeNotebookId
  );

  // cells of active notebook; remove cell
  let activeNotebookCells = activeNotebook.cells;

  if (index === undefined) {
    // put newCell at end of cells
    activeNotebookCells.push(newCell);
  } else {
    // put newCell at given index
    activeNotebookCells.splice(index, 0, newCell);
  }

  // set cells of active notebook
  activeNotebook.cells = activeNotebookCells;

  // move changed item back into main object; set local storage
  localState.notebooks[activeNotebookIndex] = activeNotebook;
  localStorage.setItem('notebookState', JSON.stringify(localState));
  window.dispatchEvent(new Event('storage'));
  if (index === undefined) {
    document.documentElement.style.scrollBehavior = 'smooth';
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView();
    }, 400);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView();
    }, 700);
    setTimeout(() => {
      document.documentElement.style.scrollBehavior = 'auto';
    }, 700);
  }
};

const Cell: React.FC<CellProps> = ({
  id,
  type,
  value,
  result,
  resultStatus,
  revert,
  index,
  defaultConn,
  conn,
  titleCell,
  admonitionType,
  language = 'json',
  memTransact,
  memQuery,
  onChange,
  onDelete,
}) => {
  return (
    <div className="dark:text-white">
      {type === 'markdown' && (
        <MarkdownCell
          id={id}
          index={index}
          value={value}
          defaultConn={defaultConn}
          titleCell={titleCell}
          addCell={addCell}
          moveCell={moveCell}
          duplicateCell={duplicateCell}
          deleteCell={deleteCell}
          onChange={onChange}
        />
      )}
      {type === 'mermaid' && (
        <MermaidCell
          id={id}
          index={index}
          value={value}
          defaultConn={defaultConn}
          addCell={addCell}
          moveCell={moveCell}
          duplicateCell={duplicateCell}
          deleteCell={deleteCell}
          onChange={onChange}
        />
      )}
      {type === 'admonition' && (
        <AdmonitionCell
          id={id}
          index={index}
          value={value}
          defaultConn={defaultConn}
          admonitionType={admonitionType}
          addCell={addCell}
          moveCell={moveCell}
          duplicateCell={duplicateCell}
          deleteCell={deleteCell}
          onChange={onChange}
        />
      )}
      {type === 'monaco' && (
        <QueryCell
          id={id}
          value={value}
          result={result}
          revert={revert}
          resultStatus={resultStatus}
          defaultConn={defaultConn}
          conn={conn}
          addCell={addCell}
          moveCell={moveCell}
          duplicateCell={duplicateCell}
          deleteCell={deleteCell}
          clearResult={clearResult}
          language={language}
          onChange={onChange}
          index={index}
          memTransact={memTransact}
          memQuery={memQuery}
        />
      )}
    </div>
  );
};

const Notebook: React.FC<NotebookProps> = ({
  id,
  storedCells,
  defaultConn,
  onCellsChange,
  memQuery,
  memTransact,
}) => {
  useEffect(() => {
    console.log('STORED CELLS: ', storedCells);
  }, [storedCells]);

  const {
    state: { defaultConn: globalConn },
  } = useGlobal();

  const getDefaultLedger = () => {
    // get local storage
    let localState = JSON.parse(localStorage.getItem('notebookState') || '[]');

    // get active notebook, index
    let activeNotebookId = localState.activeNotebookId;
    let activeNotebook = localState.notebooks.find(
      (obj: Notebook) => obj.id === activeNotebookId
    );

    let nbConn: Conn;
    if (!defaultConn) {
      nbConn = JSON.parse(globalConn);
    } else {
      nbConn = JSON.parse(defaultConn);
    }

    if (activeNotebook?.connCache) {
      if (activeNotebook.connCache[nbConn.id]) {
        return activeNotebook.connCache[nbConn.id];
      }
    }
    return null;
  };

  // using state rather than localstorage event todo: refactor
  //   const deleteCell = (idx: number) => {
  //     const newCells = storedCells.filter((_, index) => index !== idx);
  //     onCellsChange(newCells);
  //   };

  return (
    <div className="dark:text-white">
      {storedCells.map((cell, idx) => (
        <div className="cell" key={`${id}-${idx}`}>
          {/* @ts-ignore */}
          <Cell
            key={`${id}-${idx}`}
            {...cell}
            defaultConn={defaultConn}
            onChange={(newValue) => {
              const newCells = [...storedCells];
              newCells[idx].value = newValue;
              onCellsChange(newCells);
            }}
            onDelete={() => deleteCell(idx)}
            memTransact={memTransact}
            memQuery={memQuery}
            index={idx}
          />
        </div>
      ))}
      <div className="py-2">
        <AddCell
          addCell={addCell}
          conn={defaultConn}
          defaultLedger={getDefaultLedger()}
        />
      </div>
      {/* <Sandbox /> */}
    </div>
  );
};

export default Notebook;
