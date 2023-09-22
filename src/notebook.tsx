import React, { useState } from "react";
import MarkdownCell from "./markdown-cell";
import MonacoCell from "./monaco-cell";
import type { NotebookProps } from "./types/index.d.ts";

interface CellProps {
  type: "markdown" | "monaco";
  value: string;
  onChange: (value: string) => void;
  onDelete: () => void;
  createCell?: boolean;
  language?: "json" | "sparql";
}

const Cell: React.FC<CellProps> = ({
  type,
  value,
  onChange,
  createCell,
  language = "json",
  onDelete,
}) => {
  return (
    <div className="border-2 border-gray-200 rounded-xl p-4 m-4 bg-gray-50 relative">
      <button
        className="absolute  w-4 h-5 right-2 bg-red-500 text-white text-center rounded text-sm"
        onClick={onDelete}
      >
        x
      </button>
      {type === "markdown" && (
        <MarkdownCell value={value} onChange={onChange} />
      )}
      {type === "monaco" && (
        <MonacoCell value={value} createCell={createCell} language={language} />
      )}
    </div>
  );
};

const Notebook: React.FC<NotebookProps> = ({
  id,
  storedCells,
  onCellsChange,
}) => {
  const [cells, setCells] = useState<
    {
      type: "markdown" | "monaco";
      value: string;
      createCell?: boolean;
      language?: "json" | "sparql";
    }[]
  >(storedCells);

  console.log("STORED CELLS: ", storedCells);

  const addCell = (
    type: "markdown" | "monaco",
    language: "sparql" | "json" = "json"
  ) => {
    let newVal: string = "";

    if (type === "markdown") {
      newVal = "## New Markdown Cell\n Click inside to edit";
    }

    if (type === "monaco" && language === "sparql") {
      newVal = "SELECT ?s \nFROM <notebook1>\nWHERE {\n?s <type> rdfs:Class\n}";
    }

    if (type === "monaco" && language === "json") {
      newVal = JSON.stringify(
        {
          from: "notebook1",
          select: "?s",
          where: [["?s", "rdf:type", "rdfs:Class"]],
        },
        null,
        2
      );
    }

    const newCells = [...cells, { type, value: newVal, language: language }];
    console.log("NEW CELLS: ", newCells);
    setCells(newCells);
    onCellsChange(newCells);
  };

  const deleteCell = (idx: number) => {
    const newCells = cells.filter((_, index) => index !== idx);
    setCells(newCells);
    onCellsChange(newCells);
  };

  return (
    <div>
      {storedCells.map((cell, idx) => (
        <Cell
          key={idx}
          {...cell}
          onChange={(newValue) => {
            const newCells = [...cells];
            newCells[idx].value = newValue;
            setCells(newCells);
            onCellsChange(newCells);
          }}
          onDelete={() => deleteCell(idx)}
        />
      ))}
      <button
        className="m-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => addCell("markdown")}
      >
        Add Markdown Cell
      </button>
      <button
        className="m-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => addCell("monaco")}
      >
        Add FlureeQL Cell
      </button>
      <button
        className="m-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => addCell("monaco", "sparql")}
      >
        Add SQARQL Cell
      </button>
    </div>
  );
};

export default Notebook;
