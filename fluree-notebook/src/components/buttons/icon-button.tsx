const IconButton = ({ children }: { children: JSX.Element }) => {
  return (
    <span
      className={`rounded-full hover:bg-ui-neutral-800 
    cursor-pointer p-[6px] bg-opacity-20 icon-button-md -m-[]`}
    >
      {children}
    </span>
  );
};

export default IconButton;
