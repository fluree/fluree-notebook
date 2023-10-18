import IconButton from './buttons/icon-button';
import { ThemeToggle } from './buttons/theme-toggle';
import { Fluree } from './icons/fluree';
import { Gear } from './icons/gear';
import useGlobal from '../hooks/useGlobal';
import { Connections } from './icons/connections';

export const MainNav = (): JSX.Element => {
  const { dispatch } = useGlobal();
  const openSettings = (val) => dispatch({ type: 'settingsOpen', value: true });

  return (
    <div className="bg-ui-main-300 dark:bg-ui-main-900 w-[100%] h-16 relative flex items-center">
      <div className="flex flex-row gap-2 items-center justify-start absolute right-[20px]">
        <IconButton
          onClick={openSettings}
          className="dark:text-ui-main-400"
          size="lg"
        >
          <Connections />
        </IconButton>
        <ThemeToggle />
      </div>

      <Fluree />

      <div className="bg-ui-neutral-700 w-[100%] h-px absolute left-0 top-[63px]"></div>
    </div>
  );
};
