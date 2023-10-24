import { useState, useEffect } from 'react';
import { BarGraph } from './icons/barGraph';
import { SidebarItem } from './sidebar-item';
import { SelectMultiple } from './icons/selectMultiple';
import IconButton from './buttons/icon-button';
import { AddEllipse } from './icons/addEllipse';
import { XMark } from './icons/x-mark';
import { CodeBracket } from './icons/code-bracket';
import { Check } from './icons/check';
import { Delete } from './icons/delete';
import { Upload } from './icons/upload';
import { Markdown } from './icons/markdown';

type Notebook = {
  id: string;
  name: string;
};

type SelectedNotebook = {
  id: string;
  index: number;
};

export const Sidebar = ({
  notebooks,
  selectedNotebook,
  onSelectNotebook,
  addNotebook,
  addNotebooks,
  markdownToJson,
  importMarkdown,
}: {
  notebooks: Notebook[];
  selectedNotebook: string;
  onSelectNotebook: (id: string) => void;
  addNotebook: () => void;
  addNotebooks: (arr: Array<string>) => void;
  markdownToJson: (markdown: string) => void;
  importMarkdown: (id: string) => void;
}): JSX.Element => {
  const [dragging, setDragging] = useState<boolean>(false);
  const [selecting, setSelecting] = useState<boolean>(false);
  const [selectedNotebooks, setSelectedNotebooks] = useState<
    Array<SelectedNotebook>
  >([]);
  const [allSelected, setAllSelected] = useState(false);

  useEffect(() => {
    evaluateAllSelected();
  }, [selectedNotebooks]);

  const evaluateAllSelected = () => {
    let localState = JSON.parse(localStorage.getItem('notebookState') || '[]');
    let count = localState?.notebooks?.length;
    if (selectedNotebooks.length === count) {
      setAllSelected(true);
    } else {
      setAllSelected(false);
    }
  };

  const deleteNotebook = (id: string) => {
    let localState = JSON.parse(localStorage.getItem('notebookState') || '');
    const filteredNotebooks = localState.notebooks.filter(
      (notebook: any) => notebook.id !== id
    );
    localState.notebooks = filteredNotebooks;
    if (localState.activeNotebookId === id) {
      localState.activeNotebookId = null;
    }
    localStorage.setItem('notebookState', JSON.stringify(localState));
    window.dispatchEvent(new Event('storage'));
  };

  const deleteSelected = () => {
    let selectedIds = selectedNotebooks.map((p: SelectedNotebook) => p.id);
    let localState = JSON.parse(localStorage.getItem('notebookState') || '');
    const filteredNotebooks = localState.notebooks.filter(
      (notebook: Notebook) => selectedIds.indexOf(notebook.id) === -1
    );
    localState.notebooks = filteredNotebooks;
    if (selectedIds.indexOf(localState.activeNotebookId) > -1) {
      localState.activeNotebookId = null;
    }
    localStorage.setItem('notebookState', JSON.stringify(localState));
    setSelectedNotebooks([]);
    window.dispatchEvent(new Event('storage'));
  };

  const exportSelectedJSON = () => {
    let idsToExport = selectedNotebooks.map((p: SelectedNotebook) => p.id);
    exportJSON(idsToExport);
  };

  const exportSelectedMarkdown = () => {
    let idsToExport = selectedNotebooks.map((p: SelectedNotebook) => p.id);
    exportMarkdown(idsToExport);
  };

  const exportMarkdown = (idArray: Array<string>) => {
    let localState = JSON.parse(localStorage.getItem('notebookState') || '');
    for (var m = 0; m < idArray.length; m++) {
      let activeNotebook = localState.notebooks.find(
        (obj: Notebook) => obj.id === idArray[m]
      );
      let fileName = activeNotebook.name;
      let data = ``;

      for (var l = 0; l < activeNotebook.cells.length; l++) {
        let activeCell = activeNotebook.cells[l];
        if (activeCell.type === 'markdown') {
          data += activeCell.value;
        } else {
          data += '```';
          data += `${activeCell.language} \n`;
          if (activeCell.language === 'json') {
            data += JSON.stringify(JSON.parse(activeCell.value), null, 2);
          } else {
            activeCell.value.endsWith('\n')
              ? (data += activeCell.value.slice(0, -1))
              : (data += activeCell.value);
          }
          data += `\n`;
          data += '```';
        }
        data += `\n`;
      }

      console.log(data);

      let filename = `${fileName}.md`;
      let file = new Blob([data], { type: 'markdown' });

      // @ts-ignore
      if (window.navigator.msSaveOrOpenBlob)
        // IE10+
        // @ts-ignore
        window.navigator.msSaveOrOpenBlob(file, filename);
      else {
        // Others
        var a = document.createElement('a'),
          url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 0);
      }
    }
  };

  const exportJSON = (idArray: Array<string>) => {
    let localState = JSON.parse(localStorage.getItem('notebookState') || '');
    let notebooksToExport = [];
    let fileName = 'notebooksExport';

    for (var m = 0; m < idArray.length; m++) {
      let thisNotebook = localState.notebooks.find(
        (obj: Notebook) => obj.id === idArray[m]
      );
      let notebookCells = thisNotebook.cells;

      for (var i = 0; i < notebookCells.length; i++) {
        delete notebookCells[i].result;
        delete notebookCells[i].resultStatus;
        delete notebookCells[i].revert;
        delete notebookCells[i].conn;
      }
      delete thisNotebook.connCache;
      delete thisNotebook.defaultConn;
      thisNotebook.cells = notebookCells;

      if (idArray.length === 1) {
        fileName = thisNotebook.name;
      }

      notebooksToExport.push(thisNotebook);
    }

    let filename = `${fileName}.json`;
    let data = JSON.stringify(notebooksToExport, null, 2);
    let file = new Blob([data], { type: 'json' });

    // @ts-ignore
    if (window.navigator.msSaveOrOpenBlob)
      // IE10+
      // @ts-ignore
      window.navigator.msSaveOrOpenBlob(file, filename);
    else {
      // Others
      var a = document.createElement('a'),
        url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    }
  };

  const selectAllNotebooks = () => {
    let localState = JSON.parse(localStorage.getItem('notebookState') || '');
    let notebooks = localState.notebooks;
    let reducedVals = notebooks.map((p: Notebook, i: number) => ({
      id: p.id,
      index: i,
    }));
    setSelectedNotebooks(reducedVals);
  };

  const handleUploadJSON = (e) => {
    for (var i = 0; i < e.target.files.length; i++) {
      //   let reader = new FileReader();
      //   reader.onload = function (event) {
      //     addNotebooks(event.target.result);
      //     console.log(event.target.result);
      //   };
      //   reader.readAsText(e.target.files[i]);
      // }
      let thisFile = e.target.files[i];
      if (thisFile.type === 'application/json') {
        let reader = new FileReader();
        reader.onload = function (event) {
          addNotebooks(event.target.result);
        };
        reader.readAsText(thisFile);
      } else if (thisFile.type === 'text/markdown') {
        let reader = new FileReader();
        reader.onload = function (event) {
          importMarkdown(event.target.result);
          console.log(event.target.result);
        };
        reader.readAsText(thisFile);
      }
    }
  };

  return (
    <div
      style={{ zIndex: 100000 }}
      className="relative flex flex-col border-r-2 border-slate-300"
    >
      <div className="sticky top-0 marker:rounded-md w-[300px] h-[calc(100vh)] z-[1000]">
        <div className="flex justy-around pt-1 pl-1 pr-2 items-center justify-between border-b-[3px] border-slate-400 max-h-[100vh] relative">
          <div
            className="text-ui-main-900 dark:text-white flex items-center p-2 gap-1"
            style={{
              font: "var(--leading-none-text-base-font-semibold, 600 16px/16px 'Inter', sans-serif)",
            }}
          >
            <BarGraph />
            Notebooks
          </div>
          <div className="flex gap-[2px]">
            {selecting && (
              <IconButton
                onClick={() => setSelecting(!selecting)}
                className="text-ui-main-400"
                tooltip="Cancel"
              >
                <XMark />
              </IconButton>
            )}
            {!selecting && (
              <>
                <input
                  type="file"
                  id="json-upload"
                  multiple="multiple"
                  accept=".md,.mdx,.json"
                  className="hidden"
                  onChange={handleUploadJSON}
                />
                <label htmlFor="json-upload">
                  <IconButton
                    className="text-ui-main-400"
                    tooltip="Import Notebooks"
                  >
                    <Upload />
                  </IconButton>
                </label>

                <IconButton
                  onClick={() => setSelecting(!selecting)}
                  className="text-ui-main-400"
                  tooltip="Select Notebooks"
                >
                  <SelectMultiple />
                </IconButton>
                <IconButton
                  className="text-ui-main-400"
                  tooltip="New Notebook"
                  onClick={addNotebook}
                >
                  <AddEllipse />
                </IconButton>
              </>
            )}
          </div>
        </div>
        <div
          className={`bg-fluree-no-fill dark:bg-ui-main-800 flex flex-col gap-0 bg-opacity-0 dark:bg-opacity-0
        ${selecting ? 'max-h-[calc(100vh-164px)]' : 'max-h-[calc(100vh-49px)]'} 
      items-start justify-start self-stretch shrink-0 relative border-t-[1px] border-ui-neutral-500 z-[1000]`}
        >
          {notebooks.map((notebook, index) => (
            <SidebarItem
              id={notebook.id}
              key={`${notebook.id}-${index}`}
              onSelectNotebook={onSelectNotebook}
              background={
                notebook.id === selectedNotebook
                  ? 'bg-ui-main-200 dark:bg-ui-main-800'
                  : 'bg-ui-main-100 dark:bg-ui-main-900 hover:bg-ui-main-200 dark:hover:bg-ui-main-800'
              }
              text={notebook.name}
              dragging={dragging}
              setDragging={setDragging}
              index={index}
              selecting={selecting}
              selectedNotebooks={selectedNotebooks}
              setSelectedNotebooks={setSelectedNotebooks}
              exportJSON={exportJSON}
              exportMarkdown={exportMarkdown}
              deleteNotebook={deleteNotebook}
            />
          ))}
        </div>
        <div
          className={`sticky bottom-0 ${
            selecting ? 'z-[1010]' : 'z-[999]'
          } dark:bg-ui-neutral-900 bg-white border-t-[1px] border-solid border-ui-main-700`}
        >
          {selecting && (
            <>
              {!allSelected && (
                <button
                  onClick={selectAllNotebooks}
                  type="button"
                  className={`inline-flex justify-between items-center gap-x-2 rounded-md bg-ui-main-300 dark:bg-ui-main-800 px-3.5 py-2.5 text-sm 
                font-sans font-semibold dark:text-white text-gray-600 shadow-sm dark:hover:bg-ui-main-700 hover:bg-ui-main-400 focus-visible:outline 
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
                transition w-[calc(100%-24px)] my-3 mx-3 dark:disabled:bg-slate-600 disabled:bg-slate-400`}
                >
                  Select All
                  <SelectMultiple className="w-4 h-4" />
                </button>
              )}

              {allSelected && (
                <button
                  onClick={() => setSelectedNotebooks([])}
                  type="button"
                  className={`inline-flex justify-between items-center gap-x-2 rounded-md bg-ui-main-300 dark:bg-ui-main-800 px-3.5 py-2.5 text-sm 
                font-sans font-semibold dark:text-white text-gray-600 shadow-sm dark:hover:bg-ui-main-700 hover:bg-ui-main-400 focus-visible:outline 
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
                transition w-[calc(100%-24px)] my-3 mx-3 dark:disabled:bg-slate-600 disabled:bg-slate-400`}
                >
                  Deselect All
                  <SelectMultiple className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                disabled={selectedNotebooks.length === 0}
                onClick={exportSelectedJSON}
                className={`inline-flex justify-between items-center gap-x-2 rounded-md bg-ui-main-300 dark:bg-ui-main-800 px-3.5 py-2.5 text-sm 
              font-sans font-semibold dark:text-white text-gray-600 shadow-sm dark:hover:bg-ui-main-700 hover:bg-ui-main-400 focus-visible:outline 
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mt-0
              transition w-[calc(100%-24px)] my-3 mx-3 dark:disabled:bg-slate-600 disabled:bg-slate-400`}
              >
                Export JSON
                <CodeBracket className="w-4 h-4" />
              </button>

              <button
                type="button"
                disabled={selectedNotebooks.length === 0}
                onClick={exportSelectedMarkdown}
                className={`inline-flex justify-between items-center gap-x-2 rounded-md bg-ui-main-300 dark:bg-ui-main-800 px-3.5 py-2.5 text-sm 
              font-sans font-semibold dark:text-white text-gray-600 shadow-sm dark:hover:bg-ui-main-700 hover:bg-ui-main-400 focus-visible:outline 
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mt-0
              transition w-[calc(100%-24px)] my-3 mx-3 dark:disabled:bg-slate-600 disabled:bg-slate-400`}
              >
                Export Markdown
                <Markdown className="w-4 h-4" />
              </button>

              <button
                type="button"
                disabled={selectedNotebooks.length === 0}
                onClick={deleteSelected}
                className={`inline-flex justify-between items-center gap-x-2 rounded-md bg-ui-main-300 dark:bg-ui-main-800 px-3.5 py-2.5 text-sm 
              font-sans font-semibold dark:text-white text-gray-600 shadow-sm dark:hover:bg-ui-main-700 hover:bg-ui-main-400 focus-visible:outline 
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mt-0
              transition w-[calc(100%-24px)] my-3 mx-3 dark:disabled:bg-slate-600 disabled:bg-slate-400`}
              >
                Delete Selected
                <Delete className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setSelecting(false)}
                className={`inline-flex justify-between items-center gap-x-2 rounded-md bg-ui-green-300 dark:bg-ui-green-600 px-3.5 py-2.5 text-sm 
              font-sans font-semibold dark:text-white text-gray-600 shadow-sm dark:hover:bg-ui-green-500 hover:bg-ui-green-400 focus-visible:outline 
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mt-0
              transition w-[calc(100%-24px)] my-3 mx-3 dark:disabled:bg-slate-600 disabled:bg-slate-400`}
              >
                Done
                <Check className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
