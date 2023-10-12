const CellListItem = ({
  buttonText,
  addCell,
  setShowList,
  index,
}: {
  buttonText: 'Markdown' | 'FLUREEQL' | 'SPARQL';
  addCell: (value: 'Markdown' | 'FLUREEQL' | 'SPARQL', index?: number) => void;
  setShowList: (value: boolean) => void;
  index?: number;
}): JSX.Element => {
  return (
    <button
      className="hover:bg-ui-main-100 dark:hover:bg-ui-neutral-500 dark:text-white flex flex-col self-stretch"
      onClick={() => {
        setTimeout(() => {
          setShowList(false);
          window.dispatchEvent(new Event('storage'));
        }, 50);
        if (index === undefined) {
          addCell(buttonText);
        } else {
          addCell(buttonText, index);
        }
      }}
      value={buttonText}
    >
      <div className=" flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
        <div className="pt-2 pr-4 pb-2 pl-4 flex flex-row gap-0 items-center justify-start self-stretch shrink-0 relative">
          <div
            className="text-ui-neutral-900 dark:text-ui-neutral-300 dark:hover:text-white text-justified relative flex-1 text-left"
            style={{
              font: "var(--text-sm-font-medium, 500 14px/150% 'Inter', sans-serif)",
            }}
          >
            <div>{buttonText} </div>
          </div>
        </div>
      </div>
    </button>
  );
};

export const AddCellList = ({
  addCell,
  setShowList,
  index,
}: {
  addCell: (value: 'Markdown' | 'FLUREEQL' | 'SPARQL', index?: number) => void;
  setShowList: (value: boolean) => void;
  index?: number;
}): JSX.Element => {
  return (
    <div
      className="dark:bg-ui-neutral-600 rounded-lg overflow-hidden flex flex-col gap-6 items-start justify-start w-[181px] z-20 relative"
      style={{
        boxShadow:
          'var(--shadow-md-box-shadow, 0px 2px 4px -2px rgba(0, 0, 0, 0.05), 0px 4px 6px -1px rgba(0, 0, 0, 0.10))',
      }}
    >
      <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
        <CellListItem
          buttonText="Markdown"
          addCell={addCell}
          setShowList={setShowList}
          index={index}
        />
        <CellListItem
          buttonText="FLUREEQL"
          addCell={addCell}
          setShowList={setShowList}
          index={index}
        />
        <CellListItem
          buttonText="SPARQL"
          addCell={addCell}
          setShowList={setShowList}
          index={index}
        />
      </div>
    </div>
  );
};
