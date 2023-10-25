import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Notebook } from '../types';

import { Caution } from './icons/caution';
import { CheckCircle } from './icons/checkCircle';
import { ExclamationCircle } from './icons/exclamationCircle';
import { Info } from './icons/info';
import { LightBulb } from './icons/lightBulb';

const AdmonitionMenu = ({
  cellIndex,
  position,
  admonitionType,
  children,
}: {
  cellIndex: number;
  position?: string;
  admonitionType: string;
  children: any;
}) => {
  const activeClasses =
    'cursor-pointer dark:bg-ui-neutral-800 bg-gray-100 text-gray-900 dark:text-white';
  const classes =
    'dark:bg-ui-neutral-900 text-gray-700 dark:text-[rgb(220,220,220)]';

  const handleClick = (newAdmonitionType: string) => {
    updateCellAdmonition(newAdmonitionType);
  };

  const updateCellAdmonition = (newAdmonitionType: string) => {
    let localState = JSON.parse(localStorage.getItem('notebookState') || '[]');
    let activeNotebookId = localState.activeNotebookId;
    let activeNotebookIndex = localState.notebooks.findIndex(
      (obj: Notebook) => obj.id === activeNotebookId
    );
    let activeNotebook = localState.notebooks.find(
      (obj: Notebook) => obj.id === activeNotebookId
    );

    activeNotebook.cells[cellIndex].admonitionType = newAdmonitionType;

    localState.notebooks[activeNotebookIndex] = activeNotebook;
    localStorage.setItem('notebookState', JSON.stringify(localState));
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <Menu
      as="div"
      className="relative inline-flex items-center justify-center font-mono"
    >
      <Menu.Button className="inline-flex justify-center items-center rounded-md">
        {children}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={`absolute left-1 ${
            position === 'above' ? 'bottom-1' : '-top-1'
          } z-[1020] mt-2 w-56 origin-top-right divide-y divide-gray-100 
        dark:divide-ui-neutral-800 rounded-md bg-white dark:bg-ui-neutral-900 shadow-lg ring-1 ring-black 
        ring-opacity-5 focus:outline-none`}
        >
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <span
                  onClick={() => handleClick('note')}
                  className={`${
                    active ? activeClasses : classes
                  } group flex items-center px-4 py-2 text-sm`}
                >
                  <Info
                    className="mr-3 h-5 w-5 dark:text-ui-neutral-400 text-ui-neutral-400"
                    aria-hidden="true"
                  />
                  note
                  {admonitionType === 'note' && (
                    <span className="text-ui-green-400 absolute right-4">
                      <CheckCircle className="w-5 h-5 pb-[1px]" />
                    </span>
                  )}
                </span>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <span
                  onClick={() => handleClick('info')}
                  className={`${
                    active ? activeClasses : classes
                  } group flex items-center px-4 py-2 text-sm`}
                >
                  <ExclamationCircle
                    className="mr-3 h-5 w-5 dark:text-ui-main-500 text-ui-main-500"
                    aria-hidden="true"
                  />
                  info
                  {admonitionType === 'info' && (
                    <span className="text-ui-green-400 absolute right-4">
                      <CheckCircle className="w-5 h-5 pb-[1px]" />
                    </span>
                  )}
                </span>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <span
                  onClick={() => handleClick('tip')}
                  className={`${
                    active ? activeClasses : classes
                  } group flex items-center px-4 py-2 text-sm`}
                >
                  <LightBulb
                    className="mr-3 h-5 w-5 dark:text-ui-green-400 text-ui-green-400"
                    aria-hidden="true"
                  />
                  tip
                  {admonitionType === 'tip' && (
                    <span className="text-ui-green-400 absolute right-4">
                      <CheckCircle className="w-5 h-5 pb-[1px]" />
                    </span>
                  )}
                </span>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <span
                  onClick={() => handleClick('caution')}
                  className={`${
                    active ? activeClasses : classes
                  } group flex items-center px-4 py-2 text-sm`}
                >
                  <Caution
                    className="mr-3 h-5 w-5 dark:text-ui-yellow-400 text-ui-yellow-400"
                    aria-hidden="true"
                  />
                  caution
                  {admonitionType === 'caution' && (
                    <span className="text-ui-green-400 absolute right-4">
                      <CheckCircle className="w-5 h-5 pb-[1px]" />
                    </span>
                  )}
                </span>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default AdmonitionMenu;
