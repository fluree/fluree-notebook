import { useState, useRef, useEffect } from 'react';
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
import { AddCellList } from './add-cell-list';

export interface IQueryProps {}

export const QueryCell = ({
  id,
  value,
  result,
  resultStatus,
  index,
  language,
  createCell,
  addCell,
  moveCell,
  duplicateCell,
  deleteCell,
  onChange,
}: {
  id: string;
  value: string;
  result?: string;
  resultStatus?: string;
  index: number;
  language: 'sparql' | 'json';
  createCell?: boolean;
  addCell: (value: 'Markdown' | 'SPARQL' | 'FLUREEQL', index?: number) => void;
  moveCell: (direction: string, index: number) => void;
  duplicateCell: (index: number) => void;
  deleteCell: (index: number) => void;
  onClick?: (element: React.MouseEvent<HTMLElement>) => void;
  onChange: (value: string) => void;
}): JSX.Element => {
  const [resultState, setResultState] = useState<string | null>(
    result ? JSON.parse(result) : null
  );
  const [resultStatusState, setResultStatusState] = useState<
    'success' | 'error' | null
  >(null);
  const [focused, setFocused] = useState<boolean>(false);
  const [hover, setHover] = useState<boolean>(false);
  const [cellBelowMenu, setCellBelowMenu] = useState(false);
  const [cellAboveMenu, setCellAboveMenu] = useState(false);
  const [defaultAction, setDefaultAction] = useState<
    'query' | 'transact' | 'create' | null
  >(null);
  const monacoRef = useRef();
  const resultRef = useRef();
  const editorRef = useRef();
  const actionRef = useRef();
  const formatRef = useRef();

  axios.defaults.baseURL = 'http://localhost:58090/fluree';

  useEffect(() => {
    if (language === 'sparql') {
      setDefaultAction('query');
    } else {
      try {
        let keys = Object.keys(JSON.parse(value));
        let createKeys = [
          'context',
          '@context',
          'graph',
          '@graph',
          'f:ledger',
          'https://ns.flur.ee/ledger#ledger',
          'defaultContext',
          'f:defaultContext',
          'https://ns.flur.ee/ledger#defaultContext',
        ];
        let transactKeys = [
          'context',
          '@context',
          'graph',
          '@graph',
          'f:ledger',
          'https://ns.flur.ee/ledger#ledger',
        ];
        let queryKeys = [
          'select',
          'selectOne',
          'selectDistinct',
          'where',
          'from',
          't',
          'opts',
          'ledger',
          'query',
          '@context',
          'context',
          'depth',
          'groupBy',
          'orderBy',
          'having',
          'values',
        ];
        if (keys.every((e) => transactKeys.indexOf(e) > -1)) {
          setDefaultAction('transact');
        } else if (keys.every((e) => createKeys.indexOf(e) > -1)) {
          setDefaultAction('create');
        } else if (keys.every((e) => queryKeys.indexOf(e) > -1)) {
          setDefaultAction('query');
        } else {
          setDefaultAction(null);
        }
      } catch (e) {
        setDefaultAction(null);
      }
    }
  }, [value]);

  const doDefaultAction = (e) => {
    console.log(e);
    switch (e.code) {
      case 'F9':
        e.preventDefault();
        actionRef.current.click();
        break;
      case 'F8':
        e.preventDefault();
        formatRef.current.click();
    }
  };

  const flureePost = (endpoint: string) => {
    let url = `/${endpoint}`;

    if (language === 'sparql') {
      axios
        .post(url, value, {
          headers: {
            'Content-Type': 'application/sparql-query',
          },
          withCredentials: false,
        })
        .then((d) => {
          setResultStatusState('success');
          setResultState(JSON.stringify(d.data, null, 2));
        })
        .catch((e) => {
          setResultStatusState('error');
          let returnedValue = '';
          if (e.response.data.humanized) {
            returnedValue = e.response.data.humanized;
          } else {
            returnedValue = e.response.data;
          }
          setResultState(JSON.stringify(returnedValue, null, 2));
        });
    } else {
      axios
        .post(url, JSON.parse(value), {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: false,
        })
        .then((d) => {
          setResultStatusState('success');
          setResultState(JSON.stringify(d.data, null, 2));
        })
        .catch((e) => {
          setResultStatusState('error');

          let returnedValue = '';
          if (e.response.data.humanized) {
            returnedValue = e.response.data.humanized;
          } else {
            returnedValue = e.response.data;
          }
          setResultState(JSON.stringify(returnedValue, null, 2));
        });
    }
  };

  useEffect(() => {
    if (result) {
      setResultState(JSON.parse(result));
    }
    if (resultStatus) {
      setResultStatusState(resultStatus);
    }
  }, [id]);

  useEffect(() => {
    updateStoredResult();
  }, [resultState, resultStatusState]);

  const updateStoredResult = () => {
    let localState = JSON.parse(localStorage.getItem('notebookState'));
    let activeNotebookId = localState.activeNotebookId;
    let activeNotebookIndex = localState.notebooks.findIndex(
      (obj) => obj.id === activeNotebookId
    );
    let activeNotebook = localState.notebooks.find(
      (obj) => obj.id === activeNotebookId
    );
    activeNotebook.cells[index].result = JSON.stringify(resultState);
    activeNotebook.cells[index].resultStatus = resultStatusState;
    localState.notebooks[activeNotebookIndex] = activeNotebook;
    localStorage.setItem('notebookState', JSON.stringify(localState));
  };

  const handleChange = (newValue: string | undefined, _event: any) => {
    if (typeof newValue === 'string') {
      onChange(newValue);
    }
  };

  const formatEditor = () => {
    if (editorRef) {
      if (language === 'json') {
        editorRef.current['_actions']
          .get('editor.action.formatDocument')
          ['_run']();
      } else if (language === 'sparql') {
        formatSPARQL(value);
      }
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

  function formatSPARQL(query) {
    const keywords = [
      'SELECT',
      'WHERE',
      'FILTER',
      'BIND',
      'OPTIONAL',
      'ORDER BY',
      'GROUP BY',
      'LIMIT',
      'OFFSET',
      'VALUES',
      'DESCRIBE',
      'ASK',
      'CONSTRUCT',
      'FROM',
    ];

    let formattedQuery = query;

    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      formattedQuery = formattedQuery.replace(regex, keyword);
    });

    const whereRegex = /WHERE\s*{\s*([^}]+)\s*}/gi;
    formattedQuery = formattedQuery.replace(whereRegex, (match, group) => {
      const lines = group
        .split('\n')
        .map((line) => `  ${line.trim()}`)
        .join('\n');
      return `WHERE {\n${lines}\n}`;
    });

    const breakKeywords = [
      'WHERE',
      'FILTER',
      'BIND',
      'OPTIONAL',
      'ORDER BY',
      'GROUP BY',
      'LIMIT',
      'OFFSET',
    ];

    breakKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      formattedQuery = formattedQuery.replace(regex, `\n${keyword}`);
    });

    formattedQuery = formattedQuery.replace(/\n\s*\n/g, '\n').trim();
    onChange(formattedQuery);
  }

  return (
    <div className="mb-6">
      <div className="flex -ml-[10px] w-[calc(100%)] items-center justify-start pl-8">
        <div className="absolute w-60 h-8 -mb-[1px] flex items-center z-[2] overflow-hidden">
          <div
            className={`rounded-full h-[25px] w-[27px] relative animate-pulse
            ${focused || hover ? '' : 'hidden'}
          ${
            focused && defaultAction === 'create'
              ? 'bg-ui-indigo-400 dark:bg-ui-indigo-800 left-[86px]'
              : ''
          }
          ${
            focused && defaultAction === 'transact'
              ? 'bg-ui-yellow-200 dark:bg-ui-yellow-800 left-[50px]'
              : ''
          }
          ${
            focused && defaultAction === 'query'
              ? 'bg-ui-main-300 dark:bg-ui-main-800 left-[14px]'
              : ''
          }
          `}
          ></div>
        </div>
        <div
          id="monaco-toolbar"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className={`bg-ui-main-300 dark:bg-ui-neutral-700 bg-opacity-20 dark:bg-opacity-20 px-3 py-[3px] rounded-t-md
          backdrop-blur transition flex gap-1 z-10 
          ${
            focused || hover
              ? ''
              : 'dark:text-ui-neutral-500 text-ui-neutral-600'
          }`}
        >
          <IconButton
            actionRef={defaultAction === 'query' ? actionRef : null}
            onClick={() => flureePost('query')}
            tooltip="Query"
            className={
              defaultAction === 'query'
                ? `transition ${
                    focused || hover
                      ? 'text-ui-main-600 dark:text-ui-main-300'
                      : 'text-ui-main-500 dark:text-ui-main-500'
                  }`
                : ''
            }
          >
            <Search />
          </IconButton>
          {language !== 'sparql' && (
            <>
              <IconButton
                actionRef={defaultAction === 'transact' ? actionRef : null}
                onClick={() => flureePost('transact')}
                tooltip="Transact"
                className={
                  defaultAction === 'transact'
                    ? `transition ${
                        focused || hover
                          ? 'text-ui-yellow-400 dark:text-ui-yellow-300'
                          : 'text-ui-yellow-300 dark:text-ui-yellow-500'
                      }`
                    : ''
                }
              >
                <Bolt />
              </IconButton>
              <IconButton
                actionRef={defaultAction === 'create' ? actionRef : null}
                onClick={() => flureePost('create')}
                tooltip="Create Ledger"
                className={
                  defaultAction === 'create'
                    ? `transition ${
                        focused || hover
                          ? 'text-ui-indigo-700 dark:text-ui-indigo-400'
                          : 'text-ui-indigo-500 dark:text-ui-indigo-500'
                      }`
                    : ''
                }
              >
                <Plus />
              </IconButton>
            </>
          )}
          <span className="border-ui-main-900 dark:border-white border-l-[1px] opacity-20 mx-2 -mt-[2px] -mb-[2px]"></span>
          <IconButton
            onClick={formatEditor}
            tooltip="Autoformat"
            actionRef={formatRef}
          >
            <Sparkles />
          </IconButton>
          <CopyToClipboard text={value} onCopy={() => notify()}>
            <IconButton tooltip="Copy Contents">
              <Clipboard />
            </IconButton>
          </CopyToClipboard>
          {/* <IconButton tooltip="Move Cell (Drag)">
            <Handle />
          </IconButton> */}
          <span className="border-ui-main-900 dark:border-white border-l-[1px] opacity-20 mx-2 -mt-[2px] -mb-[2px]"></span>
          <IconButton
            onClick={() => duplicateCell(index)}
            tooltip="Duplicate Cell"
          >
            <Duplicate />
          </IconButton>
          <IconButton
            onClick={() => setCellAboveMenu(!cellAboveMenu)}
            tooltip="Create Cell Above"
          >
            <>
              <DocumentUp />
              {cellAboveMenu && (
                <div className="absolute">
                  <div className="absolute -left-1 -top-1">
                    <AddCellList
                      setShowList={setCellAboveMenu}
                      addCell={addCell}
                      index={index}
                    />
                  </div>
                </div>
              )}
            </>
          </IconButton>
          <IconButton
            onClick={() => setCellBelowMenu(!cellBelowMenu)}
            tooltip="Create Cell Below"
          >
            <>
              <DocumentDown />
              {cellBelowMenu && (
                <div className="absolute z-30">
                  <div className="absolute -left-1 -top-1">
                    <AddCellList
                      setShowList={setCellBelowMenu}
                      addCell={addCell}
                      index={index + 1}
                    />
                  </div>
                </div>
              )}
            </>
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
          <IconButton onClick={() => deleteCell(index)} tooltip="Delete Cell">
            <Delete />
          </IconButton>
        </div>
      </div>
      <div
        // className={`bg-ui-surface-lite-050 rounded-md border-solid  border w-[99%] relative overflow-hidden`}
        className="rounded-md border-solid border-ui-main-400 border relative overflow-hidden mr-[23px]"
      >
        <MonacoCell
          value={value}
          language={language}
          changeCallback={handleChange}
          setFocused={setFocused}
          setHover={setHover}
          monacoRef={monacoRef}
          editorRef={editorRef}
          onKeyDown={doDefaultAction}
        />
      </div>

      {resultState && (
        <div className={`pt-2 result-${resultStatusState}`}>
          <div
            className={`rounded-md border-solid ${
              resultStatusState === 'error'
                ? 'border-ui-red-400 dark:border-ui-red-300'
                : 'border-ui-green-400 dark:border-ui-green-300'
            } border relative overflow-hidden mr-[23px]`}
          >
            <MonacoCell
              value={resultState}
              language="json"
              setHover={setHover}
              monacoRef={resultRef}
              readOnly={true}
            />
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};
