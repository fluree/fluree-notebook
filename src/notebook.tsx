import React, { useState, useEffect } from 'react';
import MonacoEditor from 'react-monaco-editor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface CellProps {
  type: 'markdown' | 'monaco';
  value: string;
  onChange: (value: string) => void;
  createCell?: boolean;
}
const createJson = {
  ledger: 'notebook1',
  defaultContext: {
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
  txn: { message: 'ledger created' },
};
const MonacoCell: React.FC<{
  value: string;
  createCell?: boolean;
}> = ({ value, createCell }) => {
  const [result, setResult] = useState<string | null>(null);
  const [cellValue, setCellValue] = useState<string>(value);

  const handleQuery = async () => {
    setResult(value);
  };
  const handleTransact = async () => {
    setResult('{"block": "2"}');
  };
  const handleCreate = async () => {
    fetch('http://localhost:58090/fluree/create', {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cellValue),
    })
      .then((r) => r.json())
      .then((d) => setResult(d))
      .catch((e) => console.log(e));
  };
  useEffect(() => {
    if (createCell) {
      setCellValue(JSON.stringify(createJson, null, 2));
    }
  });
  return (
    <div className="border-2 border-gray-200 rounded-xl p-4 m-4 bg-gray-50 flex flex-col">
      <MonacoEditor
        height="200px"
        language="javascript"
        theme="vs-dark"
        options={{ padding: { top: 10 } }}
        value={cellValue}
      />
      <div>
        {createCell ? (
          <button
            className="self-start mt-4 mb-4 px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleCreate}
          >
            Create
          </button>
        ) : (
          <div>
            <button
              className="self-start mt-4 mb-4 px-4 py-2 bg-blue-600 text-white rounded"
              onClick={handleQuery}
            >
              Query
            </button>
            <button
              className="self-start mt-4 ml-4 mb-4 px-4 py-2 bg-blue-600 text-white rounded"
              onClick={handleTransact}
            >
              Transact
            </button>
          </div>
        )}
      </div>

      {result && (
        <MonacoEditor
          height="200px"
          language="javascript"
          theme="vs-dark"
          options={{ padding: { top: 10 } }}
          value={result}
        />
      )}
    </div>
  );
};

const MarkdownCell: React.FC<{
  value: string;
  onChange: (newValue: string) => void;
}> = ({ value, onChange }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  return isEditing ? (
    <div className="markdown-cell editing flex flex-col">
      <textarea
        className="h-64"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        className="self-start m-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => setIsEditing(false)}
      >
        Save
      </button>
    </div>
  ) : (
    <div className="markdown-cell" onClick={() => setIsEditing(true)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose">
        {value}
      </ReactMarkdown>
    </div>
  );
};

const Cell: React.FC<CellProps> = ({ type, value, onChange, createCell }) => {
  if (type === 'markdown') {
    return (
      <div className="border-2 border-gray-200 rounded-xl p-4 m-4 bg-gray-50">
        <MarkdownCell value={value} onChange={onChange} />
      </div>
    );
  } else if (type === 'monaco') {
    return <MonacoCell value={value} createCell={createCell} />;
  }
  return null;
};

const Notebook: React.FC = () => {
  const [cells, setCells] = useState<
    { type: 'markdown' | 'monaco'; value: string; createCell?: boolean }[]
  >([
    {
      type: 'markdown',
      value:
        '## Fluree Notebook\n- Run `http-api-gateway` on port 58090\n - `docker run -p 58090:8090 fluree/http-api-gateway`\n - "Transact" the first cell to create the Ledger',
    },
    { type: 'monaco', value: '{ "name": "John Doe" }', createCell: true },
  ]);

  const addCell = (type: 'markdown' | 'monaco') => {
    const newVal =
      type === 'markdown'
        ? '## New Markdown Cell\n Click inside to edit'
        : '{ "new": "JSON value" }';
    setCells([...cells, { type, value: newVal }]);
  };

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
    </div>
  );
};

export default Notebook;
