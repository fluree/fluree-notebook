import { useState, useEffect } from "react";
import Notebook from "./notebook";
import type { NotebookState, Cell } from "./types/index.d.ts";

const NotebookShell: React.FC = () => {

  const [state, setState] = useState<NotebookState>(() => {
    const localState = localStorage.getItem('notebookState');
    if (localState) {
      return JSON.parse(localState);
    }
    return { notebooks: [], activeNotebookId: null };
  });

  const [cells, setCells] = useState<
    { type: 'markdown' | 'monaco'; value: string; createCell?: boolean, language?: 'json' | 'sparql' }[]
  >([]);


  useEffect(() => {
    localStorage.setItem('notebookState', JSON.stringify(state));
  }, [state]);


  const addNewNotebook = () => {
    const id = Math.random().toString(36).substring(7); // generate a unique id
    setState(prevState => ({
      ...prevState,
      notebooks: [...prevState.notebooks, { id, cells: [] }],
      activeNotebookId: id
    }));
  };

  const selectNotebook = (id: string) => {
    setState(prevState => ({ ...prevState, activeNotebookId: id }));
    setCells(state.notebooks.find(n => n.id === id)?.cells || []);
  };

  const editNotebook = (id: string, cells: Cell[]) => {
    console.log("editNotebook")
    setState(prevState => {
      const notebooks = prevState.notebooks.map(notebook =>
        notebook.id === id
          ? { ...notebook, cells }
          : notebook
      );
      return { ...prevState, notebooks };
    });
  };

  return (
    <div className="flex">
      <div className="w-1/4 bg-gray-200 p-4">
        {state.notebooks.map(notebook => (
          <button key={notebook.id} onClick={() => selectNotebook(notebook.id)} className={`block w-full text-left p-2 ${notebook.id === state.activeNotebookId ? 'bg-gray-300' : ''}`}>
            Notebook {notebook.id}
          </button>
        ))}
        <button onClick={addNewNotebook} className="block w-full text-left p-2 bg-blue-500 text-white">
          New Notebook
        </button>
      </div>
      <div className="w-3/4 p-4">
        {state.activeNotebookId && (
          <Notebook
            id={state.activeNotebookId}
            storedCells={cells}
            onCellsChange={(cells: Cell[]) => editNotebook(state.activeNotebookId as string, cells)}
          />
        )}
      </div>
    </div>
  )
}

export default NotebookShell;
