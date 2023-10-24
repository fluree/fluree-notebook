import { useState, useEffect, useRef } from 'react';
import useGlobal from './hooks/useGlobal';
import Editor from '@monaco-editor/react';

const MonacoCell: React.FC<{
  value: string;
  language: 'json' | 'sparql';
  changeCallback?: (value: string | undefined, event: any) => void;
  onKeyDown: () => void;
  setFocused: (value: boolean) => void;
  setHover: (value: boolean) => void;
  monacoRef: any;
  editorRef: any;
  readOnly: boolean;
  wrap: boolean;
}> = ({
  value,
  language,
  changeCallback,
  onKeyDown,
  setFocused,
  setHover,
  monacoRef,
  editorRef,
  readOnly,
  wrap,
}) => {
  const [height, setHeight] = useState(300);

  const {
    state: { theme },
  } = useGlobal();

  useEffect(() => {
    if (monacoRef.current) {
      setEditorTheme(null, monacoRef.current);
    }
  }, [theme]);

  useEffect(() => {
    handleChange();
  }, [value]);

  const handleChange = () => {
    let lines = (value.match(/\n/g) || []).length;
    lines++;
    let pixels = 18 * lines + 20;
    /* Lines below set min & max height for editor */
    //
    // if (pixels < 110) {
    //   pixels = 110;
    // }
    // if (pixels > 488) {
    //   pixels = 488;
    // }
    setHeight(pixels);
  };

  function setEditorTheme(editor: any, monaco: any) {
    monacoRef.current = monaco;
    if (editorRef) {
      editorRef.current = editor;
    }

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

    if (editor && !readOnly) {
      editor.onDidFocusEditorWidget(() => {
        setFocused(true);
      });

      editor.onDidBlurEditorWidget(() => {
        setFocused(false);
      });

      editor.onKeyDown((e) => {
        onKeyDown(e);
      });
    }
  }

  return (
    <div>
      <div
        className="flex"
        onMouseOver={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <Editor
          language={language}
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
            readOnly: readOnly,
            wordWrap: wrap ? 'on' : 'off',
          }}
          value={value}
          height={`${height}px`}
          onChange={changeCallback ? changeCallback : handleChange}
          onMount={setEditorTheme}
        />
      </div>
    </div>
  );
};

export default MonacoCell;
