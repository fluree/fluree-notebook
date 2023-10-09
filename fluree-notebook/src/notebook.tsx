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
  language?: 'json' | 'sparql';
  addCell: (value: 'Markdown' | 'SPARQL' | 'FLUREEQL') => void;
  index: number;
}

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
        <MarkdownCell index={index} value={value} onChange={onChange} />
      )}
      {type === 'monaco' && (
        <QueryCell
          value={value}
          createCell={createCell ? createCell : undefined}
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
      newVal = '## New Markdown Cell\n Click inside to edit';
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
