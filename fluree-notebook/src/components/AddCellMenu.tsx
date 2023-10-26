import { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';

import { Sparql } from './icons/Sparql';
import { Wave1 } from './icons/Wave1';
import { Wave2 } from './icons/Wave2';
import { Mermaid } from './icons/Mermaid';
import { Markdown } from './icons/Markdown';
import { Caution } from './icons/Caution';

const AddCellMenu = ({
  addCell,
  index,
  position,
  conn,
  defaultLedger,
  children,
}: {
  addCell: (
    cellType: 'Markdown' | 'Mermaid' | 'SPARQL' | 'FLUREEQL' | 'Admonition',
    defaultLedger: string,
    conn?: string,
    index?: number
  ) => void;

  index?: number;
  position?: string;
  conn: string;
  defaultLedger: string;
  children: any;
}) => {
  const [wave, setWave] = useState(false);
  const activeClasses =
    'cursor-pointer dark:bg-ui-neutral-800 bg-gray-100 text-gray-900 dark:text-white';
  const classes =
    'dark:bg-ui-neutral-900 text-gray-700 dark:text-[rgb(220,220,220)]';

  const handleAddCell = (
    cellType: 'Markdown' | 'Mermaid' | 'SPARQL' | 'FLUREEQL' | 'Admonition'
  ) => {
    setWave(false);
    if (index !== undefined) {
      addCell(cellType, defaultLedger, conn, index);
    } else {
      addCell(cellType, defaultLedger, conn);
    }
  };

  return (
    <Menu
      as="div"
      className="relative inline-flex items-center justify-center font-mono"
    >
      <Menu.Button className="inline-flex justify-center items-center rounded-full">
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
          className={`absolute left-1 flex w-[220px]
          ${
            position === 'above'
              ? 'bottom-1 flex-col-reverse'
              : '-top-1 flex-col'
          } z-[100] mt-2 w-56 origin-top-right divide-y divide-gray-100 
        dark:divide-ui-neutral-800 rounded-md bg-white dark:bg-ui-neutral-900 shadow-lg ring-1 ring-black 
        ring-opacity-5 focus:outline-none`}
        >
          <div
            className={`py-1 flex ${
              position === 'above' ? 'flex-col-reverse' : 'flex-col'
            }`}
          >
            <Menu.Item>
              {({ active }) => (
                <span
                  onClick={() => handleAddCell('FLUREEQL')}
                  onMouseOver={() => setWave(true)}
                  onMouseOut={() => setWave(false)}
                  className={`${
                    active ? activeClasses : classes
                  } group flex items-center px-4 py-2 text-sm`}
                >
                  <span
                    className={`inline-flex items-center -ml-[2px] mr-[8px] -my-[100px] justify-center w-[24px] h-[24px] transition-transform ${
                      wave ? '-rotate-6' : ''
                    }`}
                  >
                    {!wave && (
                      <Wave1
                        className="relative left-[11px] -mr-3 -ml-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                    )}
                    {wave && (
                      <Wave2
                        className="relative left-[11px] -mr-3 -ml-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                    )}
                  </span>
                  FlureeQL
                </span>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <span
                  onClick={() => handleAddCell('SPARQL')}
                  className={`${
                    active ? activeClasses : classes
                  } group flex items-center px-4 py-2 text-sm`}
                >
                  <Sparql
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  SPARQL
                </span>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <span
                  onClick={() => handleAddCell('Markdown')}
                  className={`${
                    active ? activeClasses : classes
                  } group flex items-center px-4 py-2 text-sm`}
                >
                  <Markdown
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Markdown
                </span>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <span
                  onClick={() => handleAddCell('Mermaid')}
                  className={`${
                    active ? activeClasses : classes
                  } group flex items-center px-4 py-2 text-sm`}
                >
                  <Mermaid
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Mermaid
                </span>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <span
                  onClick={() => handleAddCell('Admonition')}
                  className={`${
                    active ? activeClasses : classes
                  } group flex items-center px-4 py-2 text-sm`}
                >
                  <Caution
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Admonition
                </span>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default AddCellMenu;
