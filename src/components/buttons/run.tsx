export const RunButton = ({
  value,
  onClick,
  buttonText,
}: {
  value: string;
  onClick?: (element: React.MouseEvent<HTMLElement>) => void;
  buttonText: string;
}): JSX.Element => {
  console.log("VALUE: ", value);
  return (
    <div className="py-2">
      <button
        value={value}
        className="text-ui-main-600 rounded border-solid border-ui-main-600 border pt-2 pr-3 pb-2 pl-3 items-center justify-center"
        onClick={onClick}
      >
        {buttonText}
      </button>
    </div>
  );
};
