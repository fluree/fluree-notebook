import { useState } from 'react';
import { AddCellList } from '../add-cell-list';

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
  const [showList, setShowList] = useState(false);
  return (
    <div className="flex flex-col dark:text-white">
      <Line />
      <button onClick={() => setShowList(!showList)}>
        <div className="bg-ui-main-100 dark:bg-ui-neutral-700 rounded-lg p-3 flex flex-col gap-0 items-start justify-start w-[180px] relative">
          <div className="flex flex-row gap-0 items-center justify-start self-stretch shrink-0 relative">
            <div
              className="text-ui-main-900 dark:text-white text-left relative flex-1 flex items-center justify-start"
              style={{
                font: "var(--leading-tight-text-sm-font-normal, 400 14px/125% 'Inter', sans-serif)",
              }}
            >
              Add Cell
            </div>
            <span className="dark:text-white">
              <Chevron down={!showList} />
            </span>
          </div>
        </div>
      </button>
      <div>
        {showList && (
          <AddCellList addCell={addCell} setShowList={setShowList} />
        )}
      </div>
    </div>
  );
};
