import { useState } from 'react';
import { AddCellList } from '../add-cell-list';
import AddCellMenu from '../add-cell-menu';
import { Plus } from '../icons/plus';
import { CheckCircleIcon } from '@heroicons/react/20/solid';

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
  conn,
  defaultLedger,
}: {
  addCell: (value: 'Markdown' | 'FLUREEQL' | 'SPARQL') => void;
  conn: string;
  defaultLedger?: string;
}): JSX.Element => {
  return (
    <div className=" justify-start items-start flex flex-col-reverse dark:text-white">
      <Line />
      <AddCellMenu
        addCell={addCell}
        position="above"
        defaultLedger={defaultLedger}
        conn={conn}
      >
        <>
          <div
            className={`inline-flex items-center gap-x-2 rounded-md bg-ui-main-300 dark:bg-ui-main-800 px-3.5 py-2.5 text-sm 
            font-sans font-semibold dark:text-white text-gray-600 shadow-sm dark:hover:bg-ui-main-700 hover:bg-ui-main-400 focus-visible:outline 
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
            transition
            `}
          >
            Add Cell
            <Plus className="-mr-0.5 h-5 w-5" aria-hidden="true" />
          </div>
        </>
      </AddCellMenu>
    </div>
  );
};
