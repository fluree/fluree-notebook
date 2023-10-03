import Editor from "@monaco-editor/react";

function setEditorTheme(editor: any, monaco: any) {
  monaco.editor.defineTheme("default", {
    base: "vs",
    inherit: true,
    rules: [
      {
        token: "comment",
        foreground: "#5d7988",
        fontStyle: "italic",
      },
      { token: "constant", foreground: "#e06c75" },
    ],
    colors: {
      "editor.background": "#F9F9F7",
    },
  });
  monaco.editor.setTheme("default");
}

const MonacoCell: React.FC<{
  value: string;
  language: "json" | "sparql";
  changeCallback?: (value: string | undefined, event: any) => void;
}> = ({ value, language, changeCallback }) => {
  return (
    <div className="flex">
      <Editor
        language={language}
        theme="default"
        options={{ padding: { top: 10 }, minimap: { enabled: false } }}
        value={value}
        height={"300px"}
        onChange={changeCallback ? changeCallback : undefined}
        onMount={setEditorTheme}
      />
    </div>
  );
};

export default MonacoCell;
