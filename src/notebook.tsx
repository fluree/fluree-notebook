import React, { useState } from "react";
import MarkdownCell from "./markdown-cell";
import type { NotebookProps } from "./types/index.d.ts";
import { QueryCell } from "./components/query-cell.tsx";

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
    <div>
      {type === "markdown" && (
        <MarkdownCell value={value} onChange={onChange} />
      )}
      {type === "monaco" && (
        <QueryCell value={value} createCell={createCell} language={language} />
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
        <div className="cell">
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
          {/* In order to run from here, I'd need to set the results state here as well
              I may want to get the run button in the QueryCell Component so that it can 
              handle it's own rendering of the results */}
        </div>
      ))}
    </div>
  );
};

export default Notebook;
