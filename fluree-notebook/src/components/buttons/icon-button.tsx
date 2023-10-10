import { Tooltip } from 'react-tippy';

const IconButton = ({
  tooltip,
  children,
  onClick,
}: {
  tooltip: string;
  children: JSX.Element;
  onClick?: (element: React.MouseEvent<HTMLElement>) => void;
}) => {
  return (
    <Tooltip animation="none" title={tooltip}>
      <span
        data-tooltip={tooltip}
        onClick={onClick}
        className={`relative rounded-full hover:bg-ui-main-400 dark:hover:bg-ui-neutral-800 
    cursor-pointer p-[6px] bg-opacity-20 flex items-center justify-center icon-button-md -m-[]`}
      >
        {children}
      </span>
    </Tooltip>
  );
};

export default IconButton;
