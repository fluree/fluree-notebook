import MarkdownCell from './markdown-cell';
import type { NotebookProps } from './types/index.d.ts';
import { QueryCell } from './components/query-cell.tsx';
import { AddCell } from './components/buttons/add-cell.tsx';

interface CellProps {
  type: 'markdown' | 'monaco';
  value: string;
  onChange: (value: string) => void;
  onDelete: () => void;
  createCell?: boolean;
  duplicateCell: (index: number) => void;
  moveCell: (direction: string, index: number) => void;
  language?: 'json' | 'sparql';
  addCell: (value: 'Markdown' | 'SPARQL' | 'FLUREEQL') => void;
  index: number;
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

  activeNotebookCells.splice(
    index,
    0,
    JSON.parse(JSON.stringify(activeNotebookCells[index]))
  );

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

const Cell: React.FC<CellProps> = ({
  type,
  value,
  onChange,
  createCell,
  language = 'json',
  onDelete,
  index,
}) => {
  return (
    <div className="dark:text-white">
      {type === 'markdown' && (
        <MarkdownCell
          index={index}
          value={value}
          duplicateCell={duplicateCell}
          moveCell={moveCell}
          onChange={onChange}
        />
      )}
      {type === 'monaco' && (
        <QueryCell
          value={value}
          createCell={createCell ? createCell : undefined}
          duplicateCell={duplicateCell}
          moveCell={moveCell}
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
  onCellsChange,
}) => {
  console.log('STORED CELLS: ', storedCells);

  const addCell = (value: 'Markdown' | 'SPARQL' | 'FLUREEQL') => {
    let newVal: string = '';
    let language: 'json' | 'sparql' = 'json';
    let type: 'monaco' | 'markdown' = 'monaco';

    if (value === 'Markdown') {
      type = 'markdown';
      newVal = '## New Markdown Cell\n Double-click to toggle editing';
    }

    if (value === 'SPARQL') {
      language = 'sparql';

      newVal = 'SELECT ?s \nFROM <notebook1>\nWHERE {\n?s <type> rdfs:Class\n}';
    }

    if (value === 'FLUREEQL') {
      newVal = JSON.stringify(
        {
          from: 'notebook1',
          select: '?s',
          where: [['?s', 'rdf:type', 'rdfs:Class']],
        },
        null,
        2
      );
    }

    const newCells = [
      ...storedCells,
      { type, value: newVal, language: language },
    ];
    console.log('NEW CELLS: ', newCells);
    onCellsChange(newCells);
  };

  const deleteCell = (idx: number) => {
    const newCells = storedCells.filter((_, index) => index !== idx);
    onCellsChange(newCells);
  };

  return (
    <div className="dark:text-white">
      {storedCells.map((cell, idx) => (
        <div className="cell" key={`${id}-${idx}`}>
          <Cell
            key={`${id}-${idx}`}
            {...cell}
            onChange={(newValue) => {
              console.log('NEW VALUE: ', newValue);
              const newCells = [...storedCells];
              newCells[idx].value = newValue;
              onCellsChange(newCells);
            }}
            onDelete={() => deleteCell(idx)}
            addCell={addCell}
            index={idx}
          />
        </div>
      ))}
      <div className="py-2">
        <AddCell addCell={addCell} />
      </div>
    </div>
  );
};

export default Notebook;
