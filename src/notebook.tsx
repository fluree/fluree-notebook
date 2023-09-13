import React, { useState } from 'react';
import MarkdownCell from './markdown-cell';
import MonacoCell from './monaco-cell';

interface CellProps {
  type: 'markdown' | 'monaco';
  value: string;
  onChange: (value: string) => void;
  onDelete: () => void;
  createCell?: boolean;
  language?: 'json' | 'sparql'
}

const Cell: React.FC<CellProps> = ({ type, value, onChange, createCell, language="json", onDelete }) => {
    return (
      <div className="border-2 border-gray-200 rounded-xl p-4 m-4 bg-gray-50 relative">
       <button 
         className="absolute  w-4 h-5 right-2 bg-red-500 text-white text-center rounded text-sm"
         onClick={onDelete}
       >

        x
       </button>
        {type === 'markdown' &&
         <MarkdownCell value={value} onChange={onChange} />}
       {type === 'monaco' && 
         <MonacoCell value={value} createCell={createCell} language={language}/>}

      </div>
    );
};

const Notebook: React.FC = () => {
  const [cells, setCells] = useState<
    { type: 'markdown' | 'monaco'; value: string; createCell?: boolean, language?: 'json' | 'sparql' }[]
  >([
    {
      type: 'markdown',
      value:
        '## Fluree Notebook\n- Run `http-api-gateway` on port 58090\n - `docker run -p 58090:8090 fluree/http-api-gateway`\n - "Transact" the first cell to create the Ledger',
    },
    { type: 'monaco', value: '{ "name": "John Doe" }', createCell: true },
  ]);

  const addCell = (type: 'markdown' | 'monaco', language: 'sparql' | 'json'="json") => {
    const newVal =
      type === 'markdown'
        ? '## New Markdown Cell\n Click inside to edit'
        : '{ "new": "JSON value" }';
    setCells([...cells, { type, value: newVal, language: language }]);
  };

  const deleteCell = (idx: number) => {
    setCells(cells.filter((_, index) => index !== idx));
  }

  return (
    <div>
      {cells.map((cell, idx) => (
        <Cell
          key={idx}
          {...cell}
          onChange={(newValue) => {
            const newCells = [...cells];
            newCells[idx].value = newValue;
            setCells(newCells);
          }}
          onDelete={() => deleteCell(idx)}
        />

      ))}
      <button
        className="m-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => addCell('markdown')}
      >
        Add Markdown Cell
      </button>
      <button
        className="m-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => addCell('monaco')}
      >
        Add FlureeQL Cell
      </button>
      <button
        className="m-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => addCell('monaco', 'sparql')}
      >
        Add SQARQL Cell
      </button>
    </div>
  );
};

export default Notebook;
