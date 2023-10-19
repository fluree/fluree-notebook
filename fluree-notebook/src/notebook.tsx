import MarkdownCell from './markdown-cell';
import type { NotebookProps } from './types/index.d.ts';
import { QueryCell } from './components/query-cell.tsx';
import { AddCell } from './components/buttons/add-cell.tsx';
import useGlobal from './hooks/useGlobal.tsx';

interface CellProps {
  id: string;
  type: 'markdown' | 'monaco';
  value: string;
  result?: string;
  resultStatus?: string;
  index: number;
  revert?: string;
  defaultConn?: string;
  createCell?: boolean;
  language?: 'json' | 'sparql';
  addCell: (value: 'Markdown' | 'SPARQL' | 'FLUREEQL', index?: number) => void;
  moveCell: (direction: string, index: number) => void;
  duplicateCell: (index: number) => void;
  deleteCell: (index: number) => void;
  clearResult: (index: number) => void;
  onChange: (value: string) => void;
  onDelete: () => void;
}

const duplicateCell = (index: number) => {
  // get local storage
  let localState = JSON.parse(localStorage.getItem('notebookState'));

  // get active notebook, index
  let activeNotebookId = localState.activeNotebookId;
  let activeNotebookIndex = localState.notebooks.findIndex(
    (obj) => obj.id === activeNotebookId
  );
  let activeNotebook = localState.notebooks.find(
    (obj) => obj.id === activeNotebookId
  );

  // cells of active notebook; remove cell
  let activeNotebookCells = activeNotebook.cells;

  const newCell = JSON.parse(JSON.stringify(activeNotebookCells[index]));
  newCell.id = Math.random().toString(36).substring(7);

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

const moveCell = (direction, index) => {
  // get local storage
  let localState = JSON.parse(localStorage.getItem('notebookState'));

  // get active notebook, index
  let activeNotebookId = localState.activeNotebookId;
  let activeNotebookIndex = localState.notebooks.findIndex(
    (obj) => obj.id === activeNotebookId
  );
  let activeNotebook = localState.notebooks.find(
    (obj) => obj.id === activeNotebookId
  );

  // cells of active notebook; remove cell
  let activeNotebookCells = activeNotebook.cells;

  let newIndex = index;
  if (direction === 'down') {
    newIndex++;
    newIndex = Math.min(...[newIndex, activeNotebookCells.length - 1]);
  } else if (direction === 'up') {
    newIndex--;
    newIndex = Math.max(...[newIndex, 0]);
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
  let localState = JSON.parse(localStorage.getItem('notebookState'));

  // get active notebook, index
  let activeNotebookId = localState.activeNotebookId;
  let activeNotebookIndex = localState.notebooks.findIndex(
    (obj) => obj.id === activeNotebookId
  );
  let activeNotebook = localState.notebooks.find(
    (obj) => obj.id === activeNotebookId
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
  let localState = JSON.parse(localStorage.getItem('notebookState'));

  // get active notebook, index
  let activeNotebookId = localState.activeNotebookId;
  let activeNotebookIndex = localState.notebooks.findIndex(
    (obj) => obj.id === activeNotebookId
  );
  let activeNotebook = localState.notebooks.find(
    (obj) => obj.id === activeNotebookId
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
      from: defaultLedger ?? 'notebook1',
      select: '?s',
      where: [['?s', 'rdf:type', 'rdfs:Class']],
    },
    null,
    2
  );

const addCell = (
  value: 'Markdown' | 'SPARQL' | 'FLUREEQL',
  conn: string,
  defaultLedger?: string,
  index?: number
) => {
  let newVal: string = '';
  let language: 'json' | 'sparql' = 'json';
  let type: 'monaco' | 'markdown' = 'monaco';

  switch (value) {
    case 'Markdown':
      type = 'markdown';
      newVal = defaultMarkdown;
      break;
    case 'SPARQL':
      language = 'sparql';
      newVal = defaultSPARQL(defaultLedger);
      break;
    case 'FLUREEQL':
      newVal = defaultFlureeQL(defaultLedger);
      break;
  }

  const id = Math.random().toString(36).substring(7); // generate a unique id
  let newCell = { id, type, conn, value: newVal, language };

  if (value === 'Markdown') {
    newCell.editing = true;
    delete newCell.conn;
  }

  // get local storage
  let localState = JSON.parse(localStorage.getItem('notebookState'));

  // get active notebook, index
  let activeNotebookId = localState.activeNotebookId;
  let activeNotebookIndex = localState.notebooks.findIndex(
    (obj) => obj.id === activeNotebookId
  );
  let activeNotebook = localState.notebooks.find(
    (obj) => obj.id === activeNotebookId
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
  createCell,
  language = 'json',
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
          addCell={addCell}
          defaultConn={defaultConn}
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
          createCell={createCell ? createCell : undefined}
          addCell={addCell}
          moveCell={moveCell}
          duplicateCell={duplicateCell}
          deleteCell={deleteCell}
          clearResult={clearResult}
          language={language}
          onChange={onChange}
          index={index}
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
}) => {
  console.log('STORED CELLS: ', storedCells);

  const {
    state: { defaultConn: globalConn },
  } = useGlobal();

  const getDefaultLedger = () => {
    // get local storage
    let localState = JSON.parse(localStorage.getItem('notebookState'));

    // get active notebook, index
    let activeNotebookId = localState.activeNotebookId;
    let activeNotebook = localState.notebooks.find(
      (obj) => obj.id === activeNotebookId
    );

    let nbConn = '';
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

  // uses state to update dom, rather than dispatching "storage" event
  //   const addCell = (value: 'Markdown' | 'SPARQL' | 'FLUREEQL') => {
  //     let newVal: string = '';
  //     let language: 'json' | 'sparql' = 'json';
  //     let type: 'monaco' | 'markdown' = 'monaco';

  //     if (value === 'Markdown') {
  //       type = 'markdown';
  //       newVal = '## New Markdown Cell\n Double-click to toggle editing';
  //     }

  //     if (value === 'SPARQL') {
  //       language = 'sparql';

  //       newVal = 'SELECT ?s \nFROM <notebook1>\nWHERE {\n?s <type> rdfs:Class\n}';
  //     }

  //     if (value === 'FLUREEQL') {
  //       newVal = JSON.stringify(
  //         {
  //           from: 'notebook1',
  //           select: '?s',
  //           where: [['?s', 'rdf:type', 'rdfs:Class']],
  //         },
  //         null,
  //         2
  //       );
  //     }

  //     const newCells = [
  //       ...storedCells,
  //       { type, value: newVal, language: language },
  //     ];
  //     console.log('NEW CELLS: ', newCells);
  //     onCellsChange(newCells);
  //   };

  // this code is a lot cleaner, so consider refactoring existing
  //   const deleteCell = (idx: number) => {
  //     const newCells = storedCells.filter((_, index) => index !== idx);
  //     onCellsChange(newCells);
  //   };

  return (
    <div className="dark:text-white">
      {storedCells.map((cell, idx) => (
        <div className="cell" key={`${id}-${idx}`}>
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
    </div>
  );
};

export default Notebook;
