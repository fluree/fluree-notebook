import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import Editor from '@monaco-editor/react';
import initEditor from 'monaco-mermaid';

import useGlobal from '../hooks/useGlobal';
import { Conn, Notebook } from '../types';

import IconButton from './buttons/IconButton';
import AddCellMenu from './AddCellMenu';

import { Check } from './icons/Check';
import { Delete } from './icons/Delete';
import { ArrowUp } from './icons/ArrowUp';
import { ArrowDown } from './icons/ArrowDown';
import { Duplicate } from './icons/Duplicate';
import { DocumentUp } from './icons/DocumentUp';
import { DocumentDown } from './icons/DocumentDown';
import { Cancel } from './icons/Cancel';

// @ts-ignore
import { Mermaid } from 'mdx-mermaid/Mermaid';
// @ts-ignore
import { mermaidTheme } from '../mermaidTheme';

const MermaidCell: React.FC<{
  id: string;
  value: string;
  index: number;
  defaultConn: string;
  titleCell?: boolean;
  addCell: (
    cellType: 'Markdown' | 'Mermaid' | 'SPARQL' | 'FLUREEQL' | 'Admonition',
    defaultLedger: string,
    conn?: string,
    index?: number
  ) => void;
  moveCell: (direction: 'up' | 'down', index: number) => void;
  duplicateCell: (index: number) => void;
  deleteCell: (index: number) => void;
  onChange: (newValue: string) => void;
}> = ({
  id,
  value,
  index,
  defaultConn,
  titleCell,
  addCell,
  moveCell,
  duplicateCell,
  deleteCell,
  onChange,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [storedValue, setStoredValue] = useState<string>(value);
  const [focused, setFocused] = useState<boolean>(false);
  const [hover, setHover] = useState<boolean>(false);
  const [theme, setTheme] = useState<string | null>(
    localStorage.getItem('theme') || 'light'
  );
  const monacoRef = useRef<any>();
  const editorRef = useRef<any>();
  const actionRef = useRef<HTMLSpanElement>();

  const {
    state: { defaultConn: globalConn, theme: globalTheme },
  } = useGlobal();

  useEffect(() => {
    setTheme(globalTheme);
  }, [globalTheme]);

  const checkRender = () => {
    // this function is a rather janky way of making sure the mermaid chart is rendered correctly on mount
    if (!isEditing) {
      let container = document.getElementById(id);
      let merm = container?.querySelector('.mermaid');
      merm?.removeAttribute('data-processed');
      let childG = merm?.querySelectorAll('g');
      if (childG?.length === 0) {
        merm?.removeAttribute('data-processed');
      }
    }
    if (value.endsWith(' ')) {
      onChange(value.trim());
    } else {
      onChange(value + ' ');
    }
  };

  useEffect(() => {
    setTimeout(() => {
      checkRender();
    }, 200);
  }, []);

  useEffect(() => {
    if (isEditing) {
      try {
        let container = document.getElementById(id);
        let merm = container?.querySelector('.mermaid');
        merm?.removeAttribute('data-processed');
      } catch (e) {
        console.warn(
          `An error occurred when trying to re-render mermaid. [cell: ${id}]`
        );
      }
    }
  }, [value, id]);

  function setEditorTheme(editor: any, monaco: any) {
    monacoRef.current = monaco;
    editorRef.current = editor;

    initEditor(monaco);

    monaco.editor.defineTheme('dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#202124',
      },
    });

    monaco.editor.defineTheme('default', {
      base: 'vs',
      inherit: true,
      rules: [
        {
          token: 'comment',
          foreground: '#5d7988',
          fontStyle: 'italic',
        },
        { token: 'constant', foreground: '#e06c75' },
      ],
      colors: {
        'editor.background': '#F9F9F7',
      },
    });

    if (localStorage.getItem('theme') === 'dark') {
      monaco.editor.setTheme('dark');
    } else {
      monaco.editor.setTheme('default');
    }

    if (editor) {
      editor.onDidFocusEditorWidget(() => {
        setFocused(true);
      });
      editor.onDidBlurEditorWidget(() => {
        setFocused(false);
      });

      editor.onKeyDown((e: KeyboardEvent) => {
        if (e.code === 'F9') {
          (actionRef.current as HTMLSpanElement).click();
        }
      });
    }
    checkRender();
  }

  useEffect(() => {
    let localState = JSON.parse(localStorage.getItem('notebookState') || '[]');
    let activeNotebookId = localState.activeNotebookId;
    let activeNotebook = localState.notebooks.find(
      (obj: Notebook) => obj.id === activeNotebookId
    );
    if (activeNotebook?.cells[index]?.editing === true) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [id]);

  const handleEditorChange = (value: any) => {
    onChange(value);
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

  const startEditing = () => {
    // start editing
    if (!titleCell) {
      setIsEditing(true);
      let localState = JSON.parse(
        localStorage.getItem('notebookState') || '[]'
      );
      let activeNotebookId = localState.activeNotebookId;
      let activeNotebookIndex = localState.notebooks.findIndex(
        (obj: Notebook) => obj.id === activeNotebookId
      );
      let activeNotebook = localState.notebooks.find(
        (obj: Notebook) => obj.id === activeNotebookId
      );
      activeNotebook.cells[index].editing = true;
      localState.notebooks[activeNotebookIndex] = activeNotebook;
      localStorage.setItem('notebookState', JSON.stringify(localState));
      setTimeout(() => {
        if (editorRef.current) {
          setStoredValue(value);
          editorRef.current.focus();
        }
      }, 200);
      window.dispatchEvent(new Event('storage'));
    }
  };

  const stopEditing = () => {
    // stop editing
    setIsEditing(false);
    let localState = JSON.parse(localStorage.getItem('notebookState') || '[]');
    let activeNotebookId = localState.activeNotebookId;
    let activeNotebookIndex = localState.notebooks.findIndex(
      (obj: Notebook) => obj.id === activeNotebookId
    );
    let activeNotebook = localState.notebooks.find(
      (obj: Notebook) => obj.id === activeNotebookId
    );
    activeNotebook.cells[index].editing = false;
    localState.notebooks[activeNotebookIndex] = activeNotebook;
    localStorage.setItem('notebookState', JSON.stringify(localState));
    window.dispatchEvent(new Event('storage'));
  };

  const cancelEditing = () => {
    handleEditorChange(storedValue);
    stopEditing();
  };

  return isEditing ? (
    <div id={id} className="mb-6">
      <div className="flex -ml-[10px] w-[calc(100%)] items-center justify-start pl-8">
        <div className="absolute w-40 h-8 -mb-[1px] flex items-center z-[2]">
          <div
            className={`rounded-full h-[25px] w-[27px] relative transition-all delay-200 animate-pulse
            ${focused || hover ? '' : 'hidden'}
          ${focused ? 'bg-ui-main-300 dark:bg-ui-main-800 left-[14px]' : ''}
          `}
          ></div>
        </div>
        <div
          id="monaco-toolbar"
          className={`bg-ui-main-300 dark:bg-ui-neutral-700 bg-opacity-20 dark:bg-opacity-20 px-3 py-[3px] rounded-t-md
          backdrop-blur transition flex gap-1 
          ${
            focused || hover
              ? ''
              : 'dark:text-ui-neutral-500 text-ui-neutral-600'
          }`}
          style={{ zIndex: 10000 - index }}
        >
          <IconButton
            onClick={stopEditing}
            tooltip={focused ? 'Done Editing [F9]' : 'Done Editing'}
            actionRef={actionRef}
            className={`transition ${
              focused || hover
                ? 'text-ui-main-600 dark:text-ui-main-300'
                : 'text-ui-main-500 dark:text-ui-main-500'
            }`}
          >
            <Check />
          </IconButton>

          <IconButton onClick={cancelEditing} tooltip="Cancel Edit">
            <Cancel />
          </IconButton>

          <span className="border-ui-main-900 dark:border-white border-l-[1px] opacity-20 mx-2 -my-[2px]"></span>

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

          <span className="border-ui-main-900 dark:border-white border-l-[1px] opacity-20 mx-2 -my-[2px]"></span>
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
        className="flex flex-row rounded-md border-solid border-2 border-ui-teal-500 border overflow-hidden mr-[23px]"
        // onDoubleClick={stopEditing}
      >
        <div
          className="w-[calc(50%)] flex"
          onMouseOver={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <Editor
            language="mermaid"
            theme={
              localStorage.getItem('theme') === 'dark' ? 'vs-dark' : 'default'
            }
            options={{
              padding: { top: 10 },
              minimap: { enabled: false },
              tabSize: 2,
              scrollBeyondLastLine: false,
              scrollbar: {
                alwaysConsumeMouseWheel: false,
              },
              wordWrap: 'on',
            }}
            value={value}
            height={'100%'}
            width={'100%'}
            onChange={handleEditorChange}
            onMount={setEditorTheme}
          />
        </div>
        <div
          onDoubleClick={stopEditing}
          className={`px-4 py-3 w-[calc(50%)] ${
            theme === 'dark' ? 'mermaid-dark' : ''
          }`}
        >
          <Mermaid config={mermaidTheme} chart={value} />
        </div>
      </div>
    </div>
  ) : (
    <div
      id={id}
      className="flex flex-row rounded-md mr-6 mb-6"
      onDoubleClick={startEditing}
    >
      <div
        className={`px-4 py-3 w-[calc(100%)] ${
          theme === 'dark' ? 'mermaid-dark' : ''
        }`}
      >
        <Mermaid config={mermaidTheme} chart={value} />
      </div>
    </div>
  );
};

export default MermaidCell;