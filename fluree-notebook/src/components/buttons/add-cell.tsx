import { useState } from 'react';
import { AddCellList } from '../add-cell-list';
import AddCellMenu from '../add-cell-menu';
import { Plus } from '../icons/plus';

export const Line = (): JSX.Element => {
  return (
    <div className="flex border-solid border-ui-surface-lite-400 border-t-4 border-r-[0] border-b-[0] border-l-[0] h-0 relative py-1"></div>
  );
};

export const Chevron = ({ down }: { down: boolean }): JSX.Element => {
  if (down) {
    return (
      <svg
        className="shrink-0 relative overflow-visible"
        style={{}}
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14.25 6.75L9 12L3.75 6.75"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  } else {
    return (
      <svg
        className="shrink-0 relative overflow-visible"
        style={{}}
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3.75 11.25L9 6L14.25 11.25"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
};

export const AddCell = ({
  addCell,
}: {
  addCell: (value: 'Markdown' | 'FLUREEQL' | 'SPARQL') => void;
}): JSX.Element => {
  return (
    <div className=" justify-start items-start flex flex-col-reverse dark:text-white">
      <Line />
      <AddCellMenu addCell={addCell} position="above">
        <div className="bg-ui-main-100 hover:bg-ui-main-200 flex dark:bg-ui-neutral-700 dark:hover:bg-ui-neutral-600 transition rounded-lg p-3 gap-0 items-start justify-between w-[180px] relative">
          Add Cell
          <span className="dark:text-white">
            <Plus />
          </span>
        </div>
      </AddCellMenu>
    </div>
  );
};
