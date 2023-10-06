import { useEffect, useRef } from 'react';
import useGlobal from './hooks/useGlobal';
import Editor from '@monaco-editor/react';

const MonacoCell: React.FC<{
  value: string;
  language: 'json' | 'sparql';
  changeCallback?: (value: string | undefined, event: any) => void;
}> = ({ value, language, changeCallback }) => {
  const monacoRef = useRef();
  const {
    state: { theme },
  } = useGlobal();

  useEffect(() => {
    if (monacoRef.current) {
      setEditorTheme(null, monacoRef.current);
    }
  }, [theme]);

  function setEditorTheme(editor: any, monaco: any) {
    monacoRef.current = monaco;
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
  }

  return (
    <div>
      <div className="flex">
        <Editor
          language={language}
          theme="default"
          options={{ padding: { top: 10 }, minimap: { enabled: false } }}
          value={value}
          height={'300px'}
          onChange={changeCallback ? changeCallback : undefined}
          onMount={setEditorTheme}
        />
      </div>
    </div>
  );
};

export default MonacoCell;
