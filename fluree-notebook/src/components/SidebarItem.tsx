import {
  useState,
  useRef,
  useEffect,
  Dispatch,
  SetStateAction,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  DragEvent,
} from 'react';

import useGlobal from '../hooks/useGlobal';
import { Notebook } from '../types';
import SidebarMenu from './SidebarMenu';
import IconButton from './buttons/IconButton';

import { Bars2 } from './icons/Bars2';
import { EllipsisVertical } from './icons/EllipsisVertical';

const SidebarItem = ({
  id,
  background,
  text,
  index,
  selecting,
  selectedNotebooks,
  setSelectedNotebooks,
  setDragging,
  onSelectNotebook,
  exportJSON,
  exportMarkdown,
  deleteNotebook,
}: {
  id: string;
  background: string;
  text: string;
  index: number;
  selecting: boolean;
  selectedNotebooks: Array<Notebook>;
  setSelectedNotebooks: Dispatch<SetStateAction<Array<Notebook>>>;
  setDragging: (dragging: boolean) => void;
  onSelectNotebook: (e: any, id: string) => void;
  exportJSON: (arr: Array<string>) => void;
  exportMarkdown: (idArr: Array<string>) => void;
  deleteNotebook: (id: string) => void;
}): JSX.Element => {
  const [editing, setEditing] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [selected, setSelected] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const handleRef = useRef<HTMLSpanElement | null>(null);

  const {
    state: { lastNotebookSelected, lastNotebookSelectedState, keyListener },
    dispatch,
  } = useGlobal();

  const updateLastSelected = (index: number) =>
    dispatch({ type: 'lastNotebookSelected', value: index });

  const updateLastSelectedState = (checked: boolean) =>
    dispatch({ type: 'lastNotebookSelectedState', value: checked });

  useEffect(() => {
    let selIndex = selectedNotebooks.findIndex(
      (obj: Notebook) => obj.id === id
    );
    if (selIndex > -1) {
      setSelected(true);
    } else {
      setSelected(false);
    }
  }, [selectedNotebooks]);

  const handleKey = (e: KeyboardEvent) => {
    if (['Escape', 'Enter'].includes(e.key)) {
      (document.activeElement as HTMLElement).blur();
    }
  };

  const resetEditing = (e: FocusEvent) => {
    setEditing(false);
    let newName = (e.target as HTMLInputElement).value;
    let localState = JSON.parse(localStorage.getItem('notebookState') || '[]');

    for (var i = 0; i < localState.notebooks.length; i++) {
      if (localState.notebooks[i].id === id) {
        localState.notebooks[i].name = newName;
        localState.notebooks[i].cells[0].value = `# ${newName}`;
        break;
      }
    }

    localStorage.setItem('notebookState', JSON.stringify(localState));
    window.dispatchEvent(new Event('storage'));
  };

  let target: any = null;
  let targetIndex: any = null;

  const handleMouseDown = (e: MouseEvent) => {
    target = e.target;
    targetIndex = index;
  };

  const handleDragStart = (e: DragEvent) => {
    if ((handleRef.current as HTMLSpanElement).contains(target)) {
      e.dataTransfer.setData('text/plain', targetIndex);
      setDragging(true);
    } else {
      e.preventDefault();
    }
  };

  const handleDragStop = () => {
    setDragging(false);
  };

  const drop = (e: DragEvent) => {
    e.preventDefault();
    var data: number = parseInt(e.dataTransfer.getData('text'));
    let localState = JSON.parse(localStorage.getItem('notebookState') || '[]');
    let notebooks = localState.notebooks;
    if (
      data < 0 ||
      data >= notebooks.length ||
      index < 0 ||
      index >= notebooks.length
    ) {
      throw new Error('Index out of bounds');
    }
    const itemToMove = notebooks.splice(data, 1)[0];
    notebooks.splice(index, 0, itemToMove);
    localState.notebooks = notebooks;
    localStorage.setItem('notebookState', JSON.stringify(localState));
    window.dispatchEvent(new Event('storage'));
    setDragging(false);
    setExpanded(false);
  };

  const allowDrop = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleChange = (e: any) => {
    setSelected(!selected);
    let arr: Array<any> = [...selectedNotebooks];
    let selIndex = selectedNotebooks.findIndex(
      (obj: Notebook) => obj.id === id
    );
    if (e.target.checked) {
      if (selIndex === -1) {
        // @ts-ignore
        arr.push({ id, index });
      }
    } else {
      if (selIndex > -1) {
        arr.splice(selIndex, 1);
      }
    }
    arr = arr.sort((a, b) => a.index - b.index);
    setSelectedNotebooks(arr);
  };

  const handleClick = (e: MouseEvent) => {
    if (keyListener['ShiftLeft'] || keyListener['ShiftRight']) {
      let arr = [...selectedNotebooks];
      if (lastNotebookSelected && lastNotebookSelected < index) {
        for (var i = index; i >= lastNotebookSelected + 1; i--) {
          let targetCheckbox = document.getElementById(
            `notebook-index-${i}`
          ) as HTMLInputElement;
          if (targetCheckbox.checked !== lastNotebookSelectedState) {
            let nbid = targetCheckbox.dataset.nbid;
            let selIndex = selectedNotebooks.findIndex(
              (obj: Notebook) => obj.id === nbid
            );
            if (!targetCheckbox.checked && nbid) {
              if (selIndex === -1) {
                // @ts-ignore
                arr.push({ id: nbid, index: i });
              }
            } else {
              if (selIndex > -1) {
                arr.splice(selIndex, 1);
              }
            }
          }
        }
        // @ts-ignore
        arr = arr.sort((a, b) => a.index - b.index);
        setSelectedNotebooks(arr);
      } else if (lastNotebookSelected && lastNotebookSelected > index) {
        for (var i = lastNotebookSelected - 1; i >= index; i--) {
          let targetCheckbox = document.getElementById(
            `notebook-index-${i}`
          ) as HTMLInputElement;
          if (targetCheckbox.checked !== lastNotebookSelectedState) {
            let nbid = targetCheckbox?.dataset.nbid;
            let selIndex = selectedNotebooks.findIndex(
              (obj: Notebook) => obj.id === nbid
            );
            if (!targetCheckbox.checked) {
              if (selIndex === -1) {
                // @ts-ignore
                arr.push({ id: nbid, index: i });
              }
            } else {
              if (selIndex > -1) {
                arr.splice(selIndex, 1);
              }
            }
          }
        }
        // @ts-ignore
        arr = arr.sort((a, b) => a.index - b.index);
        setSelectedNotebooks(arr);
      }
    } else {
      updateLastSelected(index);
      // @ts-ignore
      if (e.target.tagName === 'DIV') {
        // @ts-ignore
        let targetInput = e.target.querySelector('input');
        updateLastSelectedState(!targetInput.checked);
        setSelected(!selected);
        let arr = [...selectedNotebooks];
        let selIndex = selectedNotebooks.findIndex(
          (obj: Notebook) => obj.id === targetInput.dataset.nbid
        );
        if (!targetInput.checked) {
          if (selIndex === -1) {
            // @ts-ignore
            arr.push({
              id: targetInput.dataset.nbid,
              index: targetInput.dataset.nbindex,
            });
          }
        } else {
          if (selIndex > -1) {
            arr.splice(selIndex, 1);
          }
        }
        // @ts-ignore
        arr = arr.sort((a, b) => a.index - b.index);
        setSelectedNotebooks(arr);
      } else {
        // @ts-ignore
        updateLastSelectedState(e.target.checked);
      }
    }
  };

  return (
    <div
      className={`${background} flex flex-col gap-0 cursor-pointer items-start justify-start self-stretch
       shrink-0 relative`}
      key={id}
      draggable={!selecting}
      onDragStart={handleDragStart}
      onDragEnd={handleDragStop}
      onDragOver={() => setExpanded(true)}
      onDragLeave={() => setExpanded(false)}
      onMouseDown={handleMouseDown}
    >
      <div
        id="test-allow-drop"
        className={`${expanded ? 'h-[37px] w-[100%]' : ''}`}
        onDragOver={allowDrop}
        onDrop={drop}
      ></div>
      <div className={`w-[100%] ${expanded ? 'hidden' : ''}`}>
        <div
          className={`rounded-tl-md rounded-tr-md flex flex-row gap-0.5 items-center justify-start select-none
         self-stretch shrink-0 relative`}
        >
          <div
            onClick={(e) => onSelectNotebook(e, id)}
            className="text-[#00a0d1] text-left relative flex items-center flex-1 pt-2 pr-1.5 pb-2 pl-1.5"
            style={{
              font: "var(--text-sm-font-medium, 500 14px/150% 'Inter', sans-serif)",
            }}
          >
            {selecting && (
              <div
                onClick={handleClick}
                data-role="hitbox"
                className="flex justify-center items-center h-[36px] w-[50px] -ml-2 -my-2 -mr-1"
              >
                <input
                  type="checkbox"
                  onChange={handleChange}
                  onClick={handleClick}
                  checked={selected}
                  className={`h-4 w-4 cursor-pointer rounded text-ui-main-500 focus:ring-ui-main-500 outline-none dark:invert
                  dark:hue-rotate-180 opacity-60 checked:opacity-100 scale-110 p-2 ml-2 mr-2
                  ${
                    keyListener['ShiftLeft'] || keyListener['ShiftRight']
                      ? 'pointer-events-none'
                      : ''
                  }`}
                  id={`notebook-index-${index}`}
                  data-nbid={id}
                  data-nbindex={index}
                />
              </div>
            )}
            <input
              className={`bg-[rgba(0,0,0,0)] p-2 -my-2 -ml-1 w-full focus:ring-0 focus:ring-none active:ring-0 border-none ring-none overflow-ellipsis outline-none text-sm ${
                editing ? 'pointer-events-auto' : 'pointer-events-none'
              }`}
              disabled={!editing}
              defaultValue={text}
              ref={inputRef}
              onBlur={resetEditing}
              onKeyDown={handleKey}
            />
          </div>

          {!selecting && (
            <>
              <span
                ref={handleRef}
                className="text-ui-main-500 opacity-20 hover:opacity-100 cursor-grab active:cursor-grabbing"
              >
                <Bars2 className="w-4 h-4" />
              </span>

              <SidebarMenu
                id={id}
                setEditing={setEditing}
                inputRef={inputRef}
                exportJSON={exportJSON}
                exportMarkdown={exportMarkdown}
                deleteNotebook={deleteNotebook}
              >
                <IconButton size="md" className="text-ui-main-500">
                  <EllipsisVertical />
                </IconButton>
              </SidebarMenu>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarItem;