import { useState } from 'react';
import { Add } from './icons/add';
import { BarGraph } from './icons/barGraph';
import { SidebarItem } from './sidebar-item';
import { Tooltip } from 'react-tippy';

type Notebook = {
  id: string;
  name: string;
};

export const Sidebar = ({
  notebooks,
  selectedNotebook,
  onSelectNotebook,
  addNotebook,
}: {
  notebooks: Notebook[];
  selectedNotebook: string;
  onSelectNotebook: (id: string) => void;
  addNotebook: () => void;
}): JSX.Element => {
  const [dragging, setDragging] = useState(false);

  return (
    <div className="sticky top-0 marker:rounded-md w-[300px] h-[calc(100vh)] border-r-2 border-slate-300 z-[100]">
      <div className="flex justy-around pt-1 pl-1 pr-2 items-center justify-between border-b-[3px] border-slate-400">
        <div
          className="text-ui-main-900 dark:text-white flex items-center p-2 gap-1"
          style={{
            font: "var(--leading-none-text-base-font-semibold, 600 16px/16px 'Inter', sans-serif)",
          }}
        >
          <BarGraph />
          Notebooks
        </div>
        <button onClick={addNotebook}>
          <Tooltip distance="4" title="New Notebook">
            <Add />
          </Tooltip>
        </button>
      </div>
      <div
        className={`bg-fluree-no-fill dark:bg-ui-main-800 flex flex-col gap-0 
      items-start justify-start self-stretch shrink-0 relative border-t-[1px] border-ui-neutral-500`}
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
          />
        ))}
      </div>
    </div>
  );
};
