import { useState, useRef } from 'react';
import MonacoCell from '../monaco-cell';

import { RunButton } from './buttons/run';
import { Plus } from './icons/plus';
import { Bolt } from './icons/bolt';
import { Search } from './icons/search';
import { Sparkles } from './icons/sparkles';
import { Clipboard } from './icons/clipboard';
import { DocumentUp } from './icons/document-up';
import { DocumentDown } from './icons/document-down';
import { Duplicate } from './icons/duplicate';
import { Bars2 } from './icons/bars-2';
import { Handle } from './icons/handle';
import { Delete } from './icons/delete';
import IconButton from './buttons/icon-button';

import { CopyToClipboard } from 'react-copy-to-clipboard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import axios from 'axios';
import { ArrowUp } from './icons/arrowUp';
import { ArrowDown } from './icons/arrowDown';

export interface IQueryProps {}

export const QueryCell = ({
  value,
  createCell,
  language,
  onChange,
  index,
  duplicateCell,
  moveCell,
}: {
  value: string;
  createCell?: boolean;
  language: 'sparql' | 'json';
  onClick?: (element: React.MouseEvent<HTMLElement>) => void;
  onChange: (value: string) => void;
  index: number;
  duplicateCell: (index: number) => void;
  moveCell: (direction: string, index: number) => void;
}): JSX.Element => {
  const [result, setResult] = useState<string | null>(null);
  const [focused, setFocused] = useState<boolean>(false);
  const [hover, setHover] = useState<boolean>(false);
  const monacoRef = useRef();
  const editorRef = useRef();

  axios.defaults.baseURL = 'http://localhost:58090/fluree';

  const flureePost = (endpoint: string) => {
    let url = `/${endpoint}`;
    axios
      .post(url, JSON.parse(value), {
        withCredentials: false,
      })
      .then((d) => {
        setResult(JSON.stringify(d.data, null, 2));
      })
      .catch((e) => {
        let returnedValue = '';
        if (e.response.data.humanized) {
          returnedValue = e.response.data.humanized;
        } else {
          returnedValue = e.response.data;
        }
        console.log(e.response.data);
        setResult(JSON.stringify(returnedValue, null, 2));
      });
  };

  const handleChange = (newValue: string | undefined, _event: any) => {
    if (typeof newValue === 'string') {
      onChange(newValue);
    }
  };

  const formatEditor = () => {
    if (editorRef) {
      editorRef.current['_actions']
        .get('editor.action.formatDocument')
        ['_run']();
    }
  };

  const notify = () => {
    toast('Copied!', {
      position: 'bottom-left',
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      type: 'success',
      theme: 'colored',
    });
  };

  const deleteCell = () => {
    // get local storage
    let localState = JSON.parse(localStorage.getItem('notebookState'));

    // get active notebook, index
    let activeNotebookId = localState.activeNotebookId;
    let activeNotebookIndex = localState.notebooks.findIndex(
      (obj) => obj.id === activeNotebookId
    );
    let activeNotebook = localState.notebooks.find(
      (obj) => obj.id === activeNotebookId
    );

    // cells of active notebook; remove cell
    let activeNotebookCells = activeNotebook.cells;
    activeNotebookCells.splice(index, 1);

    // set cells of active notebook
    activeNotebook.cells = activeNotebookCells;

    // move changed item back into main object; set local storage
    localState.notebooks[activeNotebookIndex] = activeNotebook;
    localStorage.setItem('notebookState', JSON.stringify(localState));
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="mb-6">
      <div className="flex -ml-[10px] w-[calc(100%)] items-center justify-start pl-8">
        <div
          id="monaco-toolbar"
          className={`bg-ui-main-300 dark:bg-ui-neutral-700 bg-opacity-60 px-3 py-[3px] rounded-t-md
          backdrop-blur transition-opacity ${
            focused || hover ? 'opacity-100' : 'opacity-60'
          } hover:opacity-100 flex gap-1`}
        >
          <IconButton onClick={() => flureePost('query')} tooltip="Query">
            <Search />
          </IconButton>
          <IconButton onClick={() => flureePost('transact')} tooltip="Transact">
            <Bolt />
          </IconButton>
          <IconButton
            onClick={() => flureePost('create')}
            tooltip="Create Ledger"
          >
            <Plus />
          </IconButton>
          <span className="border-ui-main-900 dark:border-white border-l-[1px] opacity-20 mx-2 -mt-[2px] -mb-[2px]"></span>
          <IconButton onClick={formatEditor} tooltip="Autoformat">
            <Sparkles />
          </IconButton>
          <CopyToClipboard text={value} onCopy={() => notify()}>
            <IconButton tooltip="Copy Contents">
              <Clipboard />
            </IconButton>
          </CopyToClipboard>
          <IconButton tooltip="Move Cell (Drag)">
            <Handle />
          </IconButton>
          <span className="border-ui-main-900 dark:border-white border-l-[1px] opacity-20 mx-2 -mt-[2px] -mb-[2px]"></span>
          <IconButton
            onClick={() => duplicateCell(index)}
            tooltip="Duplicate Cell"
          >
            <Duplicate />
          </IconButton>
          <IconButton tooltip="Create Cell Below">
            <DocumentDown />
          </IconButton>
          <IconButton tooltip="Create Cell Above">
            <DocumentUp />
          </IconButton>
          <span className="border-ui-main-900 dark:border-white border-l-[1px] opacity-20 mx-2 -mt-[2px] -mb-[2px]"></span>
          <IconButton
            onClick={() => moveCell('up', index)}
            tooltip="Move Cell Up"
          >
            <ArrowUp />
          </IconButton>
          <IconButton
            onClick={() => moveCell('down', index)}
            tooltip="Move Cell Down"
          >
            <ArrowDown />
          </IconButton>
          <IconButton onClick={deleteCell} tooltip="Delete Cell">
            <Delete />
          </IconButton>
        </div>
      </div>
      <div
        className={`bg-ui-surface-lite-050 rounded-md border-solid border-ui-main-400 border w-[99%] relative overflow-hidden`}
      >
        <MonacoCell
          value={value}
          language={language}
          changeCallback={handleChange}
          setFocused={setFocused}
          setHover={setHover}
          monacoRef={monacoRef}
          editorRef={editorRef}
        />
      </div>

      {result && (
        <div className="pt-2">
          <div className="bg-ui-surface-lite-050 rounded-md border-solid border-ui-main-400 border w-[99%] relative overflow-hidden">
            <MonacoCell
              value={result}
              language="json"
              setFocused={setFocused}
              setHover={setHover}
              monacoRef={monacoRef}
              editorRef={editorRef}
            />
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};
