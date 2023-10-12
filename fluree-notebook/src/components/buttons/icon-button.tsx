import { Tooltip } from 'react-tippy';

const IconButton = ({
  tooltip,
  className,
  onClick,
  actionRef,
  children,
}: {
  tooltip: string;
  className?: string;
  children: JSX.Element;
  actionRef?: any;
  onClick?: (element: React.MouseEvent<HTMLElement>) => void;
}) => {
  return (
    <Tooltip animation="none" title={tooltip}>
      <span
        ref={actionRef}
        data-tooltip={tooltip}
        onClick={onClick}
        className={`${className} relative rounded-full hover:bg-ui-main-400 dark:hover:bg-ui-neutral-800 
    cursor-pointer p-[6px] bg-opacity-20 flex items-center justify-center icon-button-md -m-[]`}
      >
        {children}
      </span>
    </Tooltip>
  );
};

export default IconButton;
