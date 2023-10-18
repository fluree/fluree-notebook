import { Fragment, useState, useEffect } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Cube } from './icons/cube';
import { Cloud } from './icons/cloud';
import { Connections } from './icons/connections';
import useGlobal from '../hooks/useGlobal';
import { Check } from './icons/check';
import { CheckCircle } from './icons/checkCircle';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const ConnectionMenu = ({
  cellIndex,
  position,
  children,
  activeConnId,
}: {
  cellIndex?: number;
  position?: string;
  children: any;
  activeConnId: string;
}) => {
  const [instances, setInstances] = useState(
    JSON.parse(localStorage.getItem('instances'))
  );
  const [datasets, setDatasets] = useState(
    JSON.parse(localStorage.getItem('datasets'))
  );
  const activeClasses =
    'cursor-pointer dark:bg-ui-neutral-800 bg-gray-100 text-gray-900 dark:text-white';
  const classes =
    'dark:bg-ui-neutral-900 text-gray-700 dark:text-[rgb(220,220,220)]';

  const {
    state: { settingsOpen },
    dispatch,
  } = useGlobal();
  const openSettings = () => dispatch({ type: 'settingsOpen', value: true });
  const setDefaultConn = (val: string) =>
    dispatch({ type: 'defaultConn', value: val });

  const getLocalStorage = () => {
    setInstances(JSON.parse(localStorage.getItem('instances')));
    setDatasets(JSON.parse(localStorage.getItem('datasets')));
    console.log('shit was updated!');
  };

  useEffect(() => {
    window.addEventListener('storage', getLocalStorage);
    return () => {
      window.removeEventListener('storage', getLocalStorage);
    };
  }, []);

  const handleClick = (conn: string) => {
    console.log(conn);
    console.log(cellIndex);
    if (cellIndex > -1) {
      updateCellConnection(conn);
    } else {
      updateDefaultConnection(conn);
    }
  };

  const updateDefaultConnection = (conn: object) => {
    console.log('global conn was changed');
    let newConn = JSON.stringify(conn);
    localStorage.setItem('defaultConn', newConn);
    setDefaultConn(newConn);
  };

  const updateCellConnection = (conn: object) => {
    // if none if the cells have conn specified, AND
    // none of the cells have resultStatus of "success",
    // then set default notebook conn

    let newConn = JSON.stringify(conn);

    console.log(newConn);

    let localState = JSON.parse(localStorage.getItem('notebookState'));
    let activeNotebookId = localState.activeNotebookId;
    let activeNotebookIndex = localState.notebooks.findIndex(
      (obj: object) => obj.id === activeNotebookId
    );
    let activeNotebook = localState.notebooks.find(
      (obj) => obj.id === activeNotebookId
    );

    activeNotebook.cells[cellIndex].conn = newConn;

    // if all cells are same, update notebook default
    const seen = new Set();
    const result = [];

    for (const item of activeNotebook.cells) {
      if (!seen.has(item.conn) && item.conn !== undefined) {
        seen.add(item.conn);
        result.push(item.conn);
      }
    }

    if (result.length === 1) {
      activeNotebook.defaultConn = newConn;
      console.log('default notebook connection updated!');
    }

    localState.notebooks[activeNotebookIndex] = activeNotebook;
    localStorage.setItem('notebookState', JSON.stringify(localState));
    window.dispatchEvent(new Event('storage'));
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
          className={`absolute left-1 ${
            position === 'above' ? 'bottom-1' : '-top-1'
          } z-[100] mt-2 w-56 origin-top-right divide-y divide-gray-100 
        dark:divide-ui-neutral-800 rounded-md bg-white dark:bg-ui-neutral-900 shadow-lg ring-1 ring-black 
        ring-opacity-5 focus:outline-none`}
        >
          {instances.length > 0 && (
            <div className="py-1">
              {instances.map((p, i) => (
                <Menu.Item key={i}>
                  {({ active }) => (
                    <span
                      onClick={() => handleClick(p)}
                      className={classNames(
                        active ? activeClasses : classes,
                        'group flex items-center px-4 py-2 text-sm'
                      )}
                    >
                      <Cube
                        className="mr-3 h-5 w-5 text-gray-400 dark:text-ui-yellow-400 text-ui-yellow-400"
                        aria-hidden="true"
                      />
                      {p.name}
                      {p.id === activeConnId && (
                        <span className="text-ui-green-400 absolute right-4">
                          <CheckCircle className="w-5 h-5 pb-[1px]" />
                        </span>
                      )}
                    </span>
                  )}
                </Menu.Item>
              ))}
            </div>
          )}

          {datasets.length > 0 && (
            <div className="py-1">
              {datasets.map((p, i) => (
                <Menu.Item key={i}>
                  {({ active }) => (
                    <span
                      onClick={() => handleClick(p)}
                      className={classNames(
                        active ? activeClasses : classes,
                        'group flex items-center px-4 py-2 text-sm'
                      )}
                    >
                      <Cloud
                        className="mr-3 h-5 w-5 text-gray-400 dark:text-ui-main-500 text-ui-main-500"
                        aria-hidden="true"
                      />
                      {p.name}
                      {p.id === activeConnId && (
                        <span className="text-ui-green-400 absolute right-4">
                          <CheckCircle className="w-5 h-5 pb-[1px]" />
                        </span>
                      )}{' '}
                    </span>
                  )}
                </Menu.Item>
              ))}
            </div>
          )}
          {!settingsOpen && (
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <span
                    onClick={openSettings}
                    className={classNames(
                      active ? activeClasses : classes,
                      'group flex items-center px-4 py-2 text-sm'
                    )}
                  >
                    <Connections
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                    Connections
                  </span>
                )}
              </Menu.Item>
            </div>
          )}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default ConnectionMenu;
