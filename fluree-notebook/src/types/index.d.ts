interface Cell {
  type: 'markdown' | 'monaco';
  codeType?: 'fluree' | 'sparql';
  value: string;
}

interface NotebookProps {
  id: string;
  storedCells: Cell[];
  defaultConn?: string;
  onCellsChange: (cells: Cell[]) => void;
  memTransact: (val: any) => void;
  memQuery: (val: any) => void;
}

type NotebookState = {
  notebooks: Notebook[];
  activeNotebookId: string | null;
};

export type { Cell, NotebookProps, NotebookState };
