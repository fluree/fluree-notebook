import { useState } from "react";
import { Sidebar } from "./components/sidebar.tsx";
import Notebook from "./notebook.tsx";
import type { NotebookState, Cell } from "./types/index";
import { MainNav } from "./components/main-nav.tsx";

export const NotebookShell = (): JSX.Element => {
  const [state, setState] = useState<NotebookState>(() => {
    const localState = localStorage.getItem("notebookState");
    if (localState) {
      return JSON.parse(localState);
    }
    return { notebooks: [], activeNotebookId: null };
  });

  const [cells, setCells] = useState<
    {
      type: "markdown" | "monaco";
      value: string;
      createCell?: boolean;
      language?: "json" | "sparql";
    }[]
  >([]);

  const addNewNotebook = () => {
    const id = Math.random().toString(36).substring(7); // generate a unique id
    setState((prevState) => ({
      ...prevState,
      notebooks: [
        ...prevState.notebooks,
        {
          id,
          cells: [
            { value: "", language: "json", type: "monaco", createCell: true },
          ],
        },
      ],
      activeNotebookId: id,
    }));
  };

  const selectNotebook = (id: string) => {
    setState((prevState) => ({ ...prevState, activeNotebookId: id }));
    const cells = state.notebooks.find((n) => n.id === id)?.cells || [];
    console.log("CELLS: ", cells);
    setCells(cells);
  };

  const editNotebook = (id: string, cells: Cell[]) => {
    console.log("editNotebook cells ", cells);
    console.log("editNotebook id ", id);

    setCells(cells);
    setState((prevState) => {
      const notebooks = prevState.notebooks.map((notebook) =>
        notebook.id === id ? { ...notebook, cells } : notebook
      );
      return { ...prevState, notebooks };
    });
  };

  return (
    <div>
      <MainNav />
      <div className="flex">
        <div className="w-1/5 bg-white p-4 rounded-lg">
          <Sidebar
            notebooks={state.notebooks}
            selectedNotebook={state.activeNotebookId || ""}
            onSelectNotebook={selectNotebook}
            addNotebook={addNewNotebook}
          />
        </div>
        <div className="w-4/5 bg-white p-4 rounded-lg">
          {state.activeNotebookId && (
            <Notebook
              id={state.activeNotebookId}
              key={state.activeNotebookId}
              storedCells={cells}
              onCellsChange={(cells: Cell[]) =>
                editNotebook(state.activeNotebookId as string, cells)
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};
