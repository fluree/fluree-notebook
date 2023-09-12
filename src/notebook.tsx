import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Editor from '@monaco-editor/react';

interface CellProps {
  type: 'markdown' | 'monaco';
  value: string;
  onChange: (value: string) => void;
  createCell?: boolean;
  language?: 'json' | 'sparql'
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
  language: 'json' | 'sparql'
  createCell?: boolean;
}> = ({ value, createCell, language }) => {
  const [result, setResult] = useState<string | null>(null);
  const [cellValue, setCellValue] = useState<string>(value);

  const flureePost = async (e:any) => {
    let contentType:string;
    const [endPoint, language] = e.currentTarget.value.split(",");

    if(language === 'sparql') {
      contentType = 'application/sparql-query'
    }
    else {
      contentType = 'application/json'
    };

    console.log("cellValue: ", cellValue);
    fetch(`http://localhost:58090/fluree/${endPoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
      },
      body: cellValue,
    })
      .then((r) => r.json())
      .then((d) => setResult(d))
      .catch((e) => console.log(e));
  };

  useEffect(() => {
    if (createCell) {
      setCellValue(JSON.stringify(createJson, null, 2));
    }
  }, [createJson]);

  const handleChange = ((value:string | undefined, _event:any) => {
    if(typeof value === 'string') {
      setCellValue(value);
    }
  });

  return (
    <div className="border-2 border-gray-200 rounded-xl p-4 m-4 bg-gray-50 flex flex-col">
      <Editor
        height="200px"
        language={language}
        theme="vs-dark"
        options={{ padding: { top: 10 } }}
        value={cellValue}
        onChange={handleChange}
      />
      <div>
        {createCell ? (
          <button
            value="create"
            className="self-start mt-4 mb-4 px-4 py-2 bg-blue-600 text-white rounded"
            onClick={flureePost}
          >
            Create
          </button>
        ) : (
          <div>
            <button
              value={["query", language]}
              className="self-start mt-4 mb-4 px-4 py-2 bg-blue-600 text-white rounded"
              onClick={flureePost}
            >
              Query
            </button>
            <button
              value="transact"
              className="self-start mt-4 ml-4 mb-4 px-4 py-2 bg-blue-600 text-white rounded"
              onClick={flureePost}
            >
              Transact
            </button>
          </div>
        )}
      </div>

      {result && (
        <Editor
          height="200px"
          language="json"
          theme="vs-dark"
          options={{ padding: { top: 10 } }}
          value={JSON.stringify(result, null, 2)}
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
    <div className="markdown-cell editing flex flex-col p-8">
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

const Cell: React.FC<CellProps> = ({ type, value, onChange, createCell, language="json" }) => {
  if (type === 'markdown') {
    return (
      <div className="border-2 border-gray-200 rounded-xl p-4 m-4 bg-gray-50">
        <MarkdownCell value={value} onChange={onChange} />
      </div>
    );
  } else if (type === 'monaco') {
    return <MonacoCell value={value} createCell={createCell} language={language}/>;
  }
  return null;
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
