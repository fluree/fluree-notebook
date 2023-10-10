import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import Editor from '@monaco-editor/react';
import remarkGfm from 'remark-gfm';

import IconButton from './components/buttons/icon-button';

import { Check } from './components/icons/check';
import { Delete } from './components/icons/delete';
import { ArrowUp } from './components/icons/arrowUp';
import { ArrowDown } from './components/icons/arrowDown';
import { Duplicate } from './components/icons/duplicate';
import { DocumentUp } from './components/icons/document-up';
import { DocumentDown } from './components/icons/document-down';
import { Cancel } from './components/icons/cancel';

const MarkdownCell: React.FC<{
  value: string;
  onChange: (newValue: string) => void;
  duplicateCell: (index: number) => void;
  moveCell: (direction: string, index: number) => void;
  index: number;
}> = ({ value, onChange, duplicateCell, moveCell, index }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [storedValue, setStoredValue] = useState<string>(value);
  const [focused, setFocused] = useState<boolean>(false);
  const [hover, setHover] = useState<boolean>(false);
  const monacoRef = useRef();
  const editorRef = useRef();

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
    }
  }

  useEffect(() => {
    let localState = JSON.parse(localStorage.getItem('notebookState'));
    let activeNotebookId = localState.activeNotebookId;
    let activeNotebook = localState.notebooks.find(
      (obj) => obj.id === activeNotebookId
    );
    if (activeNotebook.cells[index]?.editing === true) {
      setIsEditing(true);
    }
  }, []);

  useEffect(() => {
    if (isEditing) {
      setStoredValue(value);
      setTimeout(() => {
        editorRef.current.focus();
      }, 200);
    }
  }, [isEditing]);

  const handleEditorChange = (value) => {
    console.log(editorRef.current);
    console.log(monacoRef.current);
    onChange(value);
  };

  const startEditing = () => {
    // start editing ... test commit
    let localState = JSON.parse(localStorage.getItem('notebookState'));
    let activeNotebookId = localState.activeNotebookId;
    let activeNotebookIndex = localState.notebooks.findIndex(
      (obj) => obj.id === activeNotebookId
    );
    let activeNotebook = localState.notebooks.find(
      (obj) => obj.id === activeNotebookId
    );
    activeNotebook.cells[index].editing = true;
    localState.notebooks[activeNotebookIndex] = activeNotebook;
    localStorage.setItem('notebookState', JSON.stringify(localState));
    setIsEditing(true);
  };

  const stopEditing = () => {
    // stop editing
    let localState = JSON.parse(localStorage.getItem('notebookState'));
    let activeNotebookId = localState.activeNotebookId;
    let activeNotebookIndex = localState.notebooks.findIndex(
      (obj) => obj.id === activeNotebookId
    );
    let activeNotebook = localState.notebooks.find(
      (obj) => obj.id === activeNotebookId
    );
    activeNotebook.cells[index].editing = false;
    localState.notebooks[activeNotebookIndex] = activeNotebook;
    localStorage.setItem('notebookState', JSON.stringify(localState));
    setIsEditing(false);
  };

  const deleteCell = (deleteCell) => {
    // delete cell
  };

  const cancelEditing = () => {
    handleEditorChange(storedValue);
    stopEditing();
  };

  return isEditing ? (
    <div className="mb-6">
      <div className="flex -ml-[10px] w-[calc(100%)] items-center justify-start pl-8">
        <div
          id="monaco-toolbar"
          className={`bg-ui-main-300 dark:bg-ui-neutral-700 ${
            focused || hover ? 'opacity-100' : 'opacity-60'
          } bg-opacity-60 px-3 py-[3px] rounded-t-md
          backdrop-blur transition-opacity hover:opacity-100 flex gap-1`}
        >
          <IconButton onClick={stopEditing} tooltip="Done Editing">
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
          <IconButton tooltip="Create Cell Below">
            <DocumentDown />
          </IconButton>
          <IconButton tooltip="Create Cell Above">
            <DocumentUp />
          </IconButton>
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
          <IconButton onClick={deleteCell} tooltip="Delete Cell">
            <Delete />
          </IconButton>
        </div>
      </div>
      <div
        className="flex flex-row rounded-md border-solid border-ui-purple-400 border overflow-hidden mr-[23px]"
        onDoubleClick={stopEditing}
      >
        <div
          className="w-[calc(50%)] flex"
          onMouseOver={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <Editor
            language="markdown"
            theme="default"
            options={{
              padding: { top: 10 },
              minimap: { enabled: false },
              tabSize: 2,
              scrollBeyondLastLine: false,
              scrollbar: {
                alwaysConsumeMouseWheel: false,
              },
            }}
            value={value}
            height={'100%'}
            width={'100%'}
            onChange={handleEditorChange}
            onMount={setEditorTheme}
          />
        </div>
        <div className="px-4 py-3 w-[calc(50%)]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className="prose dark:hue-rotate-180 dark:invert max-w-full min-w-full w-full"
          >
            {value}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  ) : (
    <div
      className="flex flex-row rounded-md mr-6 mb-6"
      onDoubleClick={startEditing}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        className="prose dark:hue-rotate-180 dark:invert max-w-full min-w-full w-full"
      >
        {value}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownCell;
