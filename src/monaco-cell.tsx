import React, { useState } from "react";
import Editor from "@monaco-editor/react";

const createJson = {
  ledger: "notebook1",
  defaultContext: {
    id: "@id",
    type: "@type",
    xsd: "http://www.w3.org/2001/XMLSchema#",
    rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    rdfs: "http://www.w3.org/2000/01/rdf-schema#",
    sh: "http://www.w3.org/ns/shacl#",
    schema: "http://schema.org/",
    skos: "http://www.w3.org/2008/05/skos#",
    wiki: "https://www.wikidata.org/wiki/",
    f: "https://ns.flur.ee/ledger#",
    ex: "http://example.org/",
  },
  txn: { message: "ledger created" },
};

const MonacoCell: React.FC<{
  value: string;
  language: "json" | "sparql";
  createCell?: boolean;
}> = ({ value, createCell, language }) => {
  if (createCell) {
    value = JSON.stringify(createJson, null, 2);
  }
  const [result, setResult] = useState<string | null>(null);
  const [cellValue, setCellValue] = useState<string>(value);

  const flureePost = async (element: any) => {
    let contentType: string;
    const [endPoint, language] = element.currentTarget.value.split(",");

    if (language === "sparql") {
      contentType = "application/sparql-query";
    } else {
      contentType = "application/json";
    }

    console.log("cellValue: ", cellValue);
    fetch(`http://localhost:58090/fluree/${endPoint}`, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
      },
      body: cellValue,
    })
      .then((r) => r.json())
      .then((d) => setResult(d))
      .catch((e) => console.log(e));
  };

  const handleChange = (value: string | undefined, _event: any) => {
    if (typeof value === "string") {
      setCellValue(value);
    }
  };

  return (
    <div className="border-2 border-gray-200 rounded-xl p-4 m-4 bg-gray-50 flex flex-col">
      <Editor
        height="300px"
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
          height="300px"
          language="json"
          theme="vs-dark"
          options={{ padding: { top: 10 } }}
          value={JSON.stringify(result, null, 2)}
        />
      )}
    </div>
  );
};

export default MonacoCell;
