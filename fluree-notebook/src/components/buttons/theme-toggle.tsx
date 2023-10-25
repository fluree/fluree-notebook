import { useEffect, useState } from 'react';
import useGlobal from '../../hooks/useGlobal';

import IconButton from './icon-button.js';

import { Moon } from '../icons/moon';
import { Sun } from '../icons/sun';

export const ThemeToggle = (): JSX.Element => {
  const [theme, setTheme] = useState(localStorage.getItem('theme'));

  const { dispatch } = useGlobal();
  const setGlobalTheme = (val: string) =>
    dispatch({ type: 'theme', value: val });

  useEffect(() => {
    toggleTheme();
  }, []);

  const toggleTheme = () => {
    let newTheme = '';
    if (localStorage.getItem('theme') === 'dark') {
      newTheme = 'light';
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      newTheme = 'dark';
    }
    setTimeout(() => {
      document.documentElement.classList.add('doc');
    }, 200);
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
    setGlobalTheme(newTheme);
  };

  return (
    <IconButton
      onClick={toggleTheme}
      className="p-2 cursor-pointer text-[#13C6FF] rounded-full hover:bg-[rgba(0,0,0,0.1)]"
      size="lg"
    >
      <>
        {theme === 'dark' && (
          <Moon className="w-6 h-6 text-ui-main-900 dark:text-ui-main-400" />
        )}
        {theme === 'light' && (
          <Sun className="w-6 h-6 text-ui-main-900 dark:text-ui-main-400" />
        )}
      </>
    </IconButton>
  );
};
