import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import axios from 'axios';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AddCellMenu from './add-cell-menu';
import ConnectionMenu from './conn-menu';
import IconButton from './buttons/icon-button';
import MonacoCell from '../monaco-cell';

import useGlobal from '../hooks/useGlobal';
import { Conn, Notebook } from '../types';

import { ArrowUturnLeft } from './icons/arrowUturnLeft';
import { ArrowUp } from './icons/arrowUp';
import { ArrowDown } from './icons/arrowDown';
import { Bolt } from './icons/bolt';
import { Check } from './icons/check';
import { Clipboard } from './icons/clipboard';
import { Cloud } from './icons/cloud';
import { Cube } from './icons/cube';
import { Delete } from './icons/delete';
import { DocumentDown } from './icons/document-down';
import { DocumentUp } from './icons/document-up';
import { Duplicate } from './icons/duplicate';
import { Globe } from './icons/globe';
import { Plus } from './icons/plus';
import { Search } from './icons/search';
import { Sparkles } from './icons/sparkles';

export interface IQueryProps {}

const QueryCell = ({
  id,
  value,
  result,
  resultStatus,
  revert,
  index,
  language,
  defaultConn,
  conn,
  addCell,
  moveCell,
  duplicateCell,
  deleteCell,
  clearResult,
  onChange,
  memTransact,
  memQuery,
}: {
  id: string;
  value: string;
  result?: string;
  resultStatus?: 'success' | 'error' | 'warn' | null;
  revert?: string;
  index: number;
  language: 'sparql' | 'json';
  defaultConn: string;
  conn?: string;
  addCell: (
    cellType: 'Markdown' | 'Mermaid' | 'SPARQL' | 'FLUREEQL' | 'Admonition',
    defaultLedger: string,
    conn?: string,
    index?: number
  ) => void;
  moveCell: (direction: 'up' | 'down', index: number) => void;
  duplicateCell: (index: number) => void;
  deleteCell: (index: number) => void;
  clearResult: (index: number) => void;
  onClick?: (element: React.MouseEvent<HTMLElement>) => void;
  onChange: (value: string) => void;
  memTransact: (val: string, setter: any) => void;
  memQuery: (val: string, setter: any) => void;
}): JSX.Element => {
  const [resultState, setResultState] = useState<string | null>(
    result ? JSON.parse(result) : null
  );
  const [copied, setCopied] = useState(false);
  const [resultCopied, setResultCopied] = useState(false);
  const [resultStatusState, setResultStatusState] = useState<
    'success' | 'error' | 'warn' | null
  >(null);
  const [focused, setFocused] = useState<boolean>(false);
  const [hover, setHover] = useState<boolean>(false);
  const [defaultAction, setDefaultAction] = useState<
    'query' | 'transact' | 'create' | null
  >(null);
  const monacoRef = useRef<any>();
  const resultRef = useRef<any>();
  const editorRef = useRef<any>();
  const actionRef = useRef<HTMLSpanElement>();
  const formatRef = useRef<HTMLSpanElement>();

  axios.defaults.baseURL = 'http://localhost:58090/fluree';

  const {
    state: { defaultConn: globalConn },
  } = useGlobal();

  const [connState, setConnState] = useState(
    conn
      ? JSON.parse(conn)
      : defaultConn
      ? JSON.parse(defaultConn)
      : JSON.parse(globalConn)
  );

  useEffect(() => {
    if (conn) {
      setConnState(JSON.parse(conn));
    } else if (defaultConn) {
      setConnState(JSON.parse(defaultConn));
    } else {
      setConnState(JSON.parse(globalConn));
    }
  }, [globalConn, defaultConn, conn]);

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
        if (connState.type === 'memory') {
          if (keys.every((e) => queryKeys.indexOf(e) > -1)) {
            setDefaultAction('query');
          } else {
            setDefaultAction('transact');
          }
        } else {
          if (keys.every((e) => transactKeys.indexOf(e) > -1)) {
            setDefaultAction('transact');
          } else if (keys.every((e) => createKeys.indexOf(e) > -1)) {
            if (connState.type === 'dataset') {
              setDefaultAction('transact');
            } else {
              setDefaultAction('create');
            }
          } else if (keys.every((e) => queryKeys.indexOf(e) > -1)) {
            setDefaultAction('query');
          } else {
            setDefaultAction(null);
          }
        }
      } catch (e) {
        setDefaultAction(null);
      }
    }
  }, [value, connState]);

  const doDefaultAction = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'F9':
        e.preventDefault();
        if (actionRef.current) {
          actionRef.current.click();
        } else {
          console.warn(
            'There is no default action suggested for the given transaction/query body.'
          );
          setResultState(
            'There is no default action suggested for the given transaction/query body.'
          );
          setResultStatusState('warn');
        }
        break;
      case 'F8':
        e.preventDefault();
        (formatRef.current as HTMLSpanElement).click();
    }
  };

  interface NodeItem {
    [key: string]: any;
    id?: string;
    '@id'?: string;
    name?: string;
  }

  function jsonToMermaid(data: NodeItem): string {
    let mermaidString = 'graph LR\n';
    const createdNodes = new Set<string>();
    const createdEdges = new Set<string>();
    const createdAttributes = new Set<string>();

    const createNodeId = (id: string): string => id.replace(/[:/#.]/g, '');

    const createEdgeId = (
      source: string,
      target: string,
      label: string
    ): string => `${source}-${target}-${label}`;

    const createAttributeId = (
      nodeId: string,
      attribute: string,
      value: any
    ): string => `${nodeId}-${attribute}-${value}`;

    const getIdFromItem = (item: NodeItem): string | undefined =>
      item['id'] || item['@id'];

    const processNode = (
      item: any,
      parentId: string | null = null,
      edgeLabel: string = ''
    ): void => {
      if (item === null || item === undefined) return;

      if (Array.isArray(item)) {
        item.forEach((subItem) => processNode(subItem, parentId, edgeLabel));
      } else if (typeof item === 'object' && item !== null) {
        const nodeId = getIdFromItem(item)
          ? createNodeId(getIdFromItem(item) as string)
          : createNodeId(Math.random().toString(36).substr(2, 9));

        if (!createdNodes.has(nodeId)) {
          createdNodes.add(nodeId);
          mermaidString += `  ${nodeId}(${
            item['name'] || getIdFromItem(item) || nodeId
          })\n`;
        }

        if (parentId && edgeLabel) {
          const edgeId = createEdgeId(parentId, nodeId, edgeLabel);
          if (!createdEdges.has(edgeId)) {
            createdEdges.add(edgeId);
            mermaidString += `  ${parentId} -->|${edgeLabel}| ${nodeId}\n`;
          }
        }

        Object.keys(item).forEach((key) => {
          if (key !== 'id' && key !== '@id' && key !== 'name') {
            processNode(item[key], nodeId, key);
          }
        });
      } else {
        const valueNodeId = createNodeId(
          Math.random().toString(36).substr(2, 9)
        );
        const attributeId = createAttributeId(
          parentId as string,
          edgeLabel,
          item
        );

        if (!createdAttributes.has(attributeId)) {
          createdAttributes.add(attributeId);
          mermaidString += `  ${parentId} -->|${edgeLabel}| ${valueNodeId}("${item}")\n`;
        }
      }
    };

    processNode(data);
    return mermaidString;
  }

  const flureePost = (endpoint: string, key?: string) => {
    let url = `${connState.url}/${endpoint}`;

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
          if (e.response?.data?.humanized) {
            returnedValue = e.response.data.humanized;
          } else if (e.response?.data) {
            returnedValue = e.response.data;
          } else {
            returnedValue = e.message;
          }

          if (typeof returnedValue === 'object') {
            returnedValue = JSON.stringify(returnedValue, null, 2);
          }

          setResultState(returnedValue);
        });
    } else {
      let headers: any = {
        'Content-Type': 'application/json',
      };

      if (connState.key) {
        headers['Authorization'] = `Bearer ${connState.key}`;
      }

      axios
        .post(url, JSON.parse(value), {
          headers,
          withCredentials: false,
        })
        .then((d) => {
          setResultStatusState('success');
          setResultState(JSON.stringify(d.data, null, 2));
          if (endpoint === 'query') {
            try {
              console.log(jsonToMermaid(d.data));
            } catch (e) {
              console.warn('error converting JSON string to mermaid.');
            }
          }
        })
        .catch((e) => {
          setResultStatusState('error');
          let returnedValue = '';
          if (e.response?.data?.humanized) {
            returnedValue = e.response.data.humanized;
          } else if (e.response?.data) {
            returnedValue = e.response.data;
          } else {
            returnedValue = e.message;
          }

          if (typeof returnedValue === 'object') {
            returnedValue = JSON.stringify(returnedValue, null, 2);
          }

          setResultState(returnedValue);
        });
    }
  };

  useEffect(() => {
    if (result) {
      setResultState(JSON.parse(result));
    } else {
      setResultState(null);
    }
    if (resultStatus) {
      setResultStatusState(resultStatus);
    } else {
      setResultStatusState(null);
    }
  }, [id, result, resultStatus]);

  useEffect(() => {
    if (resultState && resultStatusState) {
      updateStoredResult();
    }
  }, [resultState, resultStatusState]);

  const revertResult = () => {
    if (revert) {
      setResultState(JSON.parse(revert));
      setResultStatusState('success');
    }
  };

  useEffect(() => {
    if (conn) {
      // doesn't work for SPARQL
      if (language === 'json') {
        try {
          let val = JSON.parse(value);
          let newConn = JSON.parse(conn);
          if (newConn.type === 'dataset') {
            if (
              defaultAction &&
              ['transact', 'create'].includes(defaultAction)
            ) {
              if (val['f:ledger']) {
                val['f:ledger'] = newConn.name;
              } else if (val.ledger) {
                val.ledger = newConn.name;
              }
            } else if (defaultAction === 'query') {
              if (val.from) {
                val.from = newConn.name;
              }
            }
          }
          onChange(JSON.stringify(val, null, 2));
        } catch (e) {
          console.warn(
            `There was a problem parsing JSON value for cell ${id}.`
          );
        }
      }
    }
  }, [conn]);

  const updateStoredResult = () => {
    let localState = JSON.parse(localStorage.getItem('notebookState') || '[]');
    let activeNotebookId = localState.activeNotebookId;
    let activeNotebookIndex = localState.notebooks.findIndex(
      (obj: Notebook) => obj.id === activeNotebookId
    );
    let activeNotebook = localState.notebooks.find(
      (obj: Notebook) => obj.id === activeNotebookId
    );
    activeNotebook.cells[index].result = JSON.stringify(resultState);
    activeNotebook.cells[index].resultStatus = resultStatusState;
    if (resultStatusState === 'success') {
      activeNotebook.cells[index].revert = JSON.stringify(resultState);
      let ledger = '';
      // doesn't work for SPARQL...
      if (language === 'json') {
        let val = JSON.parse(value);
        if (defaultAction && ['transact', 'create'].includes(defaultAction)) {
          if (val['f:ledger']) {
            ledger = val['f:ledger'];
          } else if (val.ledger) {
            ledger = val.ledger;
          }
        } else if (defaultAction === 'query') {
          if (val.from) {
            ledger = val.from;
          }
        }

        if (!activeNotebook.connCache) {
          activeNotebook.connCache = {};
        }

        activeNotebook.connCache[connState.id] = ledger;
      }
    }

    localState.notebooks[activeNotebookIndex] = activeNotebook;
    localStorage.setItem('notebookState', JSON.stringify(localState));
    window.dispatchEvent(new Event('storage'));
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

  const indicateCopied = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const indicateResultCopied = () => {
    setResultCopied(true);
    setTimeout(() => {
      setResultCopied(false);
    }, 2000);
  };

  const notify = () => {
    toast('Copied!', {
      position: 'bottom-left',
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      className: 'bg-ui-green-600 text-white',
    });
  };

  const getDefaultLedger = () => {
    // get local storage
    let localState = JSON.parse(localStorage.getItem('notebookState') || '[]');

    // get active notebook, index
    let activeNotebookId = localState.activeNotebookId;
    let activeNotebook = localState.notebooks.find(
      (obj: Notebook) => obj.id === activeNotebookId
    );

    let nbConn: Conn;
    if (!defaultConn) {
      nbConn = JSON.parse(globalConn);
    } else {
      nbConn = JSON.parse(defaultConn);
    }

    if (activeNotebook?.connCache) {
      if (activeNotebook.connCache[nbConn.id]) {
        return activeNotebook.connCache[nbConn.id];
      }
    }
    return null;
  };

  function formatSPARQL(query: string) {
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
        .map((line: string) => `  ${line.trim()}`)
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
    <div className="mb-6" id={id}>
      <div className="flex -ml-[10px] w-[calc(100%)] justify-start pl-8 items-end">
        <div className="absolute w-60 h-8 -mb-[1px] flex items-center -z-2 overflow-hidden">
          <div
            className={`rounded-full h-[25px] w-[27px] relative bottom-[4px] animate-pulse
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
          style={{ zIndex: 10000 - index }}
          className={`bg-ui-main-300 dark:bg-ui-neutral-700 bg-opacity-20 dark:bg-opacity-20 px-3 py-[3px] rounded-t-md
          backdrop-blur transition flex gap-1
          ${
            focused || hover
              ? ''
              : 'dark:text-ui-neutral-500 text-ui-neutral-600'
          }`}
        >
          <IconButton
            actionRef={defaultAction === 'query' ? actionRef : null}
            onClick={
              connState.type === 'memory'
                ? () => memQuery(value, setResultState)
                : () => flureePost('query')
            }
            tooltip={
              defaultAction === 'query' && focused ? 'Query [F9]' : 'Query'
            }
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
                onClick={
                  connState.type === 'memory'
                    ? () => memTransact(value, setResultState)
                    : () => flureePost('transact')
                }
                tooltip={
                  defaultAction === 'transact' && focused
                    ? 'Transact [F9]'
                    : 'Transact'
                }
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

              {!['dataset', 'memory'].includes(connState.type) && (
                <IconButton
                  actionRef={defaultAction === 'create' ? actionRef : null}
                  onClick={() => flureePost('create')}
                  tooltip={
                    defaultAction === 'create' && focused
                      ? 'Create Ledger [F9]'
                      : 'Create Ledger'
                  }
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
              )}
            </>
          )}

          <span className="border-ui-main-900 dark:border-white border-l-[1px] opacity-20 mx-2 -mt-[2px] -mb-[2px]"></span>

          <IconButton
            onClick={formatEditor}
            tooltip={focused ? 'Autoformat [F8]' : 'Autoformat'}
            actionRef={formatRef}
          >
            <Sparkles />
          </IconButton>

          {copied && (
            <CopyToClipboard text={value} onCopy={indicateCopied}>
              <IconButton tooltip="Copied!">
                <Check />
              </IconButton>
            </CopyToClipboard>
          )}
          {!copied && (
            <CopyToClipboard text={value} onCopy={indicateCopied}>
              <IconButton tooltip="Copy Contents">
                <Clipboard />
              </IconButton>
            </CopyToClipboard>
          )}

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

          <AddCellMenu
            addCell={addCell}
            index={index}
            conn={defaultConn}
            defaultLedger={getDefaultLedger()}
          >
            <IconButton tooltip="Create Cell Above">
              <DocumentUp />
            </IconButton>
          </AddCellMenu>

          <AddCellMenu
            addCell={addCell}
            index={index + 1}
            conn={defaultConn}
            defaultLedger={getDefaultLedger()}
          >
            <IconButton tooltip="Create Cell Below">
              <DocumentDown />
            </IconButton>
          </AddCellMenu>

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
        <div
          id="data-source"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{ zIndex: 10000 - 2 * index }}
          className={`bg-ui-main-300 dark:bg-ui-neutral-700 bg-opacity-20 dark:bg-opacity-20 px-4 pb-[8px] pt-[10px] ml-3 font-mono rounded-t-md
          backdrop-blur transition flex gap-1 z-10 text-sm  text-ui-neutral-800 dark:text-ui-neutral-300 hover:dark:text-gray-300 cursor-pointer delay-200 
          ${
            focused || hover
              ? 'dark:text-opacity-100 text-opacity-100'
              : 'dark:text-opacity-50 text-opacity-50'
          }
          `}
        >
          <ConnectionMenu activeConnId={connState.id} cellIndex={index}>
            {connState.type === 'instance' && (
              <Cube
                className={`mr-[5px] -ml-[2px] -mt-[1px] h-5 w-5 text-ui-yellow-400 dark:text-ui-yellow-400 delay-200 transition 
                ${
                  focused || hover
                    ? 'dark:text-opacity-100 text-opacity-100'
                    : 'dark:text-opacity-50 text-opacity-50'
                }`}
                aria-hidden="true"
              />
            )}
            {connState.type === 'dataset' && (
              <Cloud
                className={`mr-[5px] -ml-[2px] -mt-[1px] h-5 w-5 text-ui-main-500 dark:text-ui-main-500 delay-200 transition 
              ${
                focused || hover
                  ? 'dark:text-opacity-100 text-opacity-100'
                  : 'dark:text-opacity-50 text-opacity-50'
              }`}
                aria-hidden="true"
              />
            )}
            {connState.type === 'memory' && (
              <Globe
                className={`mr-[5px] -ml-[2px] -mt-[1px] h-5 w-5 text-ui-green-500 dark:text-ui-green-500 delay-200 transition 
              ${
                focused || hover
                  ? 'dark:text-opacity-100 text-opacity-100'
                  : 'dark:text-opacity-50 text-opacity-50'
              }`}
                aria-hidden="true"
              />
            )}
            {connState.name}
          </ConnectionMenu>
        </div>
      </div>
      <div
        // className={`bg-ui-surface-lite-050 rounded-md border-solid  border w-[99%] relative overflow-hidden`}
        className="rounded-md border-solid border-2 border-ui-main-400 border relative overflow-hidden mr-[23px]"
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
            className={`rounded-md border-solid border-2 ${
              resultStatusState === 'error'
                ? 'border-ui-red-400 dark:border-ui-red-300'
                : resultStatusState === 'warn'
                ? 'border-ui-yellow-400 dark:border-ui-yellow-300'
                : 'border-ui-green-400 dark:border-ui-green-300'
            } border relative overflow-hidden mr-[23px]`}
          >
            <div className="flex -ml-[10px] w-[calc(100%)] items-center justify-end pr-4">
              <div
                id="result-toolbar"
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                className={`bg-ui-main-300 dark:bg-ui-neutral-700 bg-opacity-20 dark:bg-opacity-20 px-3 py-[3px] -mb-9 rounded-b-md
          backdrop-blur transition flex gap-1 z-10 
          ${
            focused || hover
              ? 'opacity-1000'
              : 'opacity-0 dark:text-ui-neutral-500 text-ui-neutral-600'
          }`}
              >
                {revert && resultStatusState !== 'success' && (
                  <>
                    <IconButton onClick={revertResult} tooltip="Revert Results">
                      <ArrowUturnLeft />
                    </IconButton>

                    <span className="border-ui-main-900 dark:border-white border-l-[1px] opacity-20 mx-2 -mt-[2px] -mb-[2px]"></span>
                  </>
                )}

                {resultCopied && (
                  <CopyToClipboard
                    text={resultState}
                    onCopy={indicateResultCopied}
                  >
                    <IconButton tooltip="Copied!">
                      <Check />
                    </IconButton>
                  </CopyToClipboard>
                )}
                {!resultCopied && (
                  <CopyToClipboard
                    text={resultState}
                    onCopy={indicateResultCopied}
                  >
                    <IconButton tooltip="Copy Contents">
                      <Clipboard />
                    </IconButton>
                  </CopyToClipboard>
                )}

                <IconButton
                  onClick={() => clearResult(index)}
                  tooltip="Clear Result"
                >
                  <Delete />
                </IconButton>
              </div>
            </div>
            <MonacoCell
              value={resultState}
              language="json"
              setHover={setHover}
              monacoRef={resultRef}
              readOnly={true}
              wrap={true}
            />
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default QueryCell;
