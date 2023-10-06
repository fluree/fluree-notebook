import { useEffect, useState } from 'react';
import useGlobal from '../../hooks/useGlobal.jsx';
import { Moon } from '../icons/moon';
import { Sun } from '../icons/sun';

export const ThemeToggle = (): JSX.Element => {
  const [theme, setTheme] = useState(localStorage.getItem('theme'));

  const { dispatch } = useGlobal();
  const setGlobalTheme = (val) => dispatch({ type: 'theme', value: val });

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
    <div
      onClick={toggleTheme}
      className="p-2 cursor-pointer text-[#13C6FF] rounded-full hover:bg-[rgba(0,0,0,0.1)]"
    >
      {theme === 'dark' && <Moon />}
      {theme === 'light' && <Sun />}
    </div>
  );
};
