import { Tooltip } from 'react-tippy';

const IconButton = ({
  tooltip,
  className,
  size = 'md',
  onClick,
  actionRef,
  children,
}: {
  tooltip?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: JSX.Element;
  actionRef?: any;
  onClick?: (element: React.MouseEvent<HTMLElement>) => void;
}) => {
  const getPadding = () => {
    switch (size) {
      case 'md':
        return 'p-[6px]';
      case 'lg':
        return 'p-[10px]';
      default:
        return 'p-[6px]';
    }
  };

  if (!tooltip) {
    return (
      <span
        ref={actionRef}
        data-tooltip={tooltip}
        onClick={onClick}
        className={`${className} relative rounded-full hover:bg-ui-main-400 dark:hover:bg-ui-neutral-800 
            cursor-pointer ${getPadding()} bg-opacity-20 flex items-center justify-center ${
          size ? `icon-button-${size}` : 'icon-button-md'
        } transition`}
      >
        {children}
      </span>
    );
  }
  return (
    <Tooltip animation="none" title={tooltip}>
      <span
        ref={actionRef}
        data-tooltip={tooltip}
        onClick={onClick}
        className={`${className} relative rounded-full hover:bg-ui-main-400 dark:hover:bg-ui-neutral-800 
    cursor-pointer ${getPadding()} bg-opacity-20 flex items-center justify-center ${
          size ? `icon-button-${size}` : 'icon-button-md'
        } transition`}
      >
        {children}
      </span>
    </Tooltip>
  );
};

export default IconButton;
