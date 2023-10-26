import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import Editor from '@monaco-editor/react';
import remarkGfm from 'remark-gfm';

import useGlobal from '../hooks/useGlobal';
import { Conn, Notebook } from '../types';
import AddCellMenu from './AddCellMenu';
import IconButton from './buttons/IconButton';
import CodeBlock from '../Codeblock';

import { ArrowDown } from './icons/ArrowDown';
import { ArrowUp } from './icons/ArrowUp';
import { Cancel } from './icons/Cancel';
import { Check } from './icons/Check';
import { Delete } from './icons/Delete';
import { Duplicate } from './icons/Duplicate';
import { DocumentDown } from './icons/DocumentDown';
import { DocumentUp } from './icons/DocumentUp';

const MarkdownCell: React.FC<{
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
  const monacoRef = useRef<any>();
  const editorRef = useRef<any>();
  const actionRef = useRef<HTMLSpanElement>();

  const {
    state: { defaultConn: globalConn },
  } = useGlobal();

  function setEditorTheme(editor: any, monaco: any) {
    monacoRef.current = monaco;
    editorRef.current = editor;
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
        className="flex flex-row rounded-md border-solid border-2 border-ui-purple-400 overflow-hidden mr-[23px]"
        // onDoubleClick={stopEditing}
      >
        <div
          className="w-[calc(50%)] flex"
          onMouseOver={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <Editor
            language="markdown"
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
        <div className="px-4 py-3 w-[calc(50%)]" onDoubleClick={stopEditing}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className="prose dark:invert dark:hue-rotate-180 max-w-full min-w-full w-full"
            // components={{ code: Code }}
            components={{
              code({ inline, className, children, ...props }) {
                if (inline) return <code {...props}>{children}</code>;

                const value = String(children).replace(/\n$/, '');
                let language = '';
                if (className) {
                  language = className.replace('language-', '');
                }

                // if (className === 'language-callout')
                //   return <Callout>{value}</Callout>;

                return <CodeBlock language={language} value={value} />;
              },
            }}
          >
            {value}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  ) : (
    <div
      id={id}
      className="flex flex-row rounded-md mr-6 mb-6"
      onDoubleClick={startEditing}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        className="prose dark:invert dark:hue-rotate-180 max-w-full min-w-full w-full"
        components={{
          code({ inline, className, children, ...props }) {
            if (inline) return <code {...props}>{children}</code>;
            const value = String(children).replace(/\n$/, '');
            let language = className?.replace('language-', '') || '';
            return <CodeBlock language={language} value={value} />;
          },
        }}
      >
        {value}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownCell;
