const CellListItem = ({
  buttonText,
  addCell,
  setShowList,
}: {
  buttonText: "Markdown" | "FLUREEQL" | "SPARQL";
  addCell: (value: "Markdown" | "FLUREEQL" | "SPARQL") => void;
  setShowList: (value: boolean) => void;
}): JSX.Element => {
  return (
    <button
      className="hover:bg-ui-main-100 flex flex-col self-stretch"
      onClick={() => {
        setShowList(false);
        addCell(buttonText);
      }}
      value={buttonText}
    >
      <div className=" flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
        <div className="pt-2 pr-4 pb-2 pl-4 flex flex-row gap-0 items-center justify-start self-stretch shrink-0 relative">
          <div
            className="text-ui-neutral-900 text-justified relative flex-1 text-left"
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
}: {
  addCell: (value: "Markdown" | "FLUREEQL" | "SPARQL") => void;
  setShowList: (value: boolean) => void;
}): JSX.Element => {
  return (
    <div
      className="rounded-lg flex flex-col gap-6 items-start justify-start w-[181px] relative"
      style={{
        boxShadow:
          "var(--shadow-md-box-shadow, 0px 2px 4px -2px rgba(0, 0, 0, 0.05), 0px 4px 6px -1px rgba(0, 0, 0, 0.10))",
      }}
    >
      <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
        <CellListItem
          buttonText="Markdown"
          addCell={addCell}
          setShowList={setShowList}
        />
        <CellListItem
          buttonText="FLUREEQL"
          addCell={addCell}
          setShowList={setShowList}
        />
        <CellListItem
          buttonText="SPARQL"
          addCell={addCell}
          setShowList={setShowList}
        />
      </div>
    </div>
  );
};
