export const AddCellList = (): JSX.Element => {
  return (
    <div
      className="bg-white rounded-lg flex flex-col gap-6 items-start justify-start w-[181px] relative"
      style={{
        boxShadow:
          "var(--shadow-md-box-shadow, 0px 2px 4px -2px rgba(0, 0, 0, 0.05), 0px 4px 6px -1px rgba(0, 0, 0, 0.10))",
      }}
    >
      <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
        <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
          <div className="pt-2 pr-4 pb-2 pl-4 flex flex-row gap-0 items-center justify-start self-stretch shrink-0 relative">
            <div
              className="text-ui-neutral-900 text-justified relative flex-1"
              style={{
                font: "var(--text-sm-font-medium, 500 14px/150% 'Inter', sans-serif)",
              }}
            >
              <button>Markdown </button>
            </div>
          </div>
        </div>
        <div className="bg-ui-main-100 flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
          <div className="bg-ui-neutral-200 self-stretch shrink-0 h-px relative"></div>
          <div className="pt-2 pr-4 pb-2 pl-4 flex flex-row gap-0 items-center justify-start self-stretch shrink-0 relative">
            <div
              className="text-ui-neutral-900 text-justified relative flex-1"
              style={{
                font: "var(--text-sm-font-medium, 500 14px/150% 'Inter', sans-serif)",
              }}
            >
              <button>FLUREEQL </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
          <div className="bg-ui-neutral-200 self-stretch shrink-0 h-px relative"></div>
          <div className="pt-2 pr-4 pb-2 pl-4 flex flex-row gap-0 items-center justify-start self-stretch shrink-0 relative">
            <div
              className="text-ui-neutral-900 text-justified relative flex-1"
              style={{
                font: "var(--text-sm-font-medium, 500 14px/150% 'Inter', sans-serif)",
              }}
            >
              <button>SPARQL </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
