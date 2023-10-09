import { useState, useRef } from 'react';
import SidebarMenu from './sidebar-menu';
import { Bars2 } from './icons/bars-2';

export const SidebarItem = ({
  id,
  background,
  text,
  index,
  dragging,
  setDragging,
  onSelectNotebook,
}: {
  id: string;
  background: string;
  text: string;
  index: number;
  dragging: boolean;
  setDragging: (dragging: boolean) => void;
  onSelectNotebook: (id: string) => void;
}): JSX.Element => {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef();
  const handleRef = useRef();

  const handleKey = (e) => {
    if (['Escape', 'Enter'].includes(e.key)) {
      document.activeElement.blur();
    }
  };

  const resetEditing = (e) => {
    setEditing(false);
    let newName = e.target.value;
    let localState = JSON.parse(localStorage.getItem('notebookState'));

    for (var i = 0; i < localState.notebooks.length; i++) {
      if (localState.notebooks[i].id === id) {
        localState.notebooks[i].name = newName;
        break;
      }
    }

    localStorage.setItem('notebookState', JSON.stringify(localState));
    window.dispatchEvent(new Event('storage'));
  };

  let target = false;
  let targetIndex = false;

  const handleMouseDown = (e) => {
    target = e.target;
    targetIndex = index;
    // target = index;
  };

  const handleDragStart = (e) => {
    if (handleRef.current.contains(target)) {
      e.dataTransfer.setData('text/plain', targetIndex);
      setDragging(true);
    } else {
      e.preventDefault();
    }
  };

  const handleDragStop = () => {
    setDragging(false);
  };

  const drop = (e) => {
    e.preventDefault();
    var data = e.dataTransfer.getData('text');
    let localState = JSON.parse(localStorage.getItem('notebookState'));
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

  const allowDrop = (e) => {
    e.preventDefault();
  };

  return (
    <div
      className={`${background} flex flex-col gap-0 cursor-pointer items-start justify-start self-stretch
       shrink-0 relative`}
      key={id}
      draggable
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
          className={`rounded-tl-md rounded-tr-md flex flex-row gap-0.5 items-center justify-start
         self-stretch shrink-0 relative`}
        >
          <div
            onClick={() => onSelectNotebook(id)}
            className="text-[#00a0d1] text-left relative flex-1 pt-2 pr-1.5 pb-2 pl-1.5"
            style={{
              font: "var(--text-sm-font-medium, 500 14px/150% 'Inter', sans-serif)",
            }}
          >
            <input
              className={`bg-[rgba(0,0,0,0)] p-2 -my-2 -ml-1 w-full outline-none overflow-ellipsis ${
                editing ? 'pointer-events-auto' : 'pointer-events-none'
              }`}
              disabled={!editing}
              defaultValue={text}
              ref={inputRef}
              onBlur={resetEditing}
              onKeyDown={handleKey}
            />
          </div>

          <span
            ref={handleRef}
            className="text-ui-main-500 opacity-20 hover:opacity-100 cursor-grab active:cursor-grabbing"
          >
            <Bars2 />
          </span>

          <span className="hover:bg-[rgba(10,10,10,0.3)] rounded-full flex items-center justify-center mr-1 ml-2">
            <SidebarMenu id={id} setEditing={setEditing} inputRef={inputRef} />
          </span>
        </div>
      </div>
    </div>
  );
};
