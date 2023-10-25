interface Cell {
  id: string;
  type: 'markdown' | 'monaco' | 'mermaid' | 'admonition';
  codeType?: 'fluree' | 'sparql';
  value: string;
  conn?: string;
  language: 'json' | 'sparql';
  editing?: boolean;
  admonitionType?: 'note' | 'info' | 'tip' | 'caution';
  titleCell?: boolean;
}

interface NotebookProps {
  id: string;
  storedCells: Cell[];
  defaultConn: string;
  onCellsChange: (cells: Cell[]) => void;
  memTransact: (val: string, setter: any) => Promise<void>;
  memQuery: (val: string, setter: any) => Promise<void>;
}

type NotebookState = {
  notebooks: Notebook[];
  activeNotebookId: string | null;
};

type Notebook = {
  id: string;
  name: string;
  index?: number;
  cells?: Array<Cell>;
  defaultConn?: string | undefined;
};

type Conn = {
  id: string;
  name: string;
  type: string;
  url: string;
  key?: string;
  new?: boolean;
};

declare module 'mdx-mermaid/Mermaid';

export type { Cell, NotebookProps, NotebookState, Notebook, Conn };
