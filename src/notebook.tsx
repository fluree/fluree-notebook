import React, { useState } from "react";
import MarkdownCell from "./markdown-cell";
import type { NotebookProps } from "./types/index.d.ts";
import { QueryCell } from "./components/query-cell.tsx";
import { AddCell } from "./components/buttons/add-cell.tsx";

interface CellProps {
  type: "markdown" | "monaco";
  value: string;
  onChange: (value: string) => void;
  onDelete: () => void;
  createCell?: boolean;
  language?: "json" | "sparql";
  addCell: (value: "Markdown" | "SPARQL" | "FLUREEQL") => void;
}

const Cell: React.FC<CellProps> = ({
  type,
  value,
  onChange,
  createCell,
  language = "json",
  onDelete,
  addCell,
}) => {
  return (
    <div>
      {type === "markdown" && (
        <MarkdownCell value={value} onChange={onChange} addCell={addCell} />
      )}
      {type === "monaco" && (
        <QueryCell
          value={value}
          createCell={createCell}
          language={language}
          addCell={addCell}
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
  const [cells, setCells] = useState<
    {
      type: "markdown" | "monaco";
      value: string;
      createCell?: boolean;
      language?: "json" | "sparql";
    }[]
  >(storedCells);

  console.log("STORED CELLS: ", storedCells);

  const addCell = (value: "Markdown" | "SPARQL" | "FLUREEQL") => {
    let newVal: string = "";
    let language: "json" | "sparql" = "json";
    let type: "monaco" | "markdown" = "monaco";
    console.log("ADD CELL CLICKE WITH VALUE ", value);

    if (value === "Markdown") {
      type = "markdown";
      newVal = "## New Markdown Cell\n Click inside to edit";
    }

    if (value === "SPARQL") {
      language = "sparql";

      newVal = "SELECT ?s \nFROM <notebook1>\nWHERE {\n?s <type> rdfs:Class\n}";
    }

    if (value === "FLUREEQL") {
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
            addCell={addCell}
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
