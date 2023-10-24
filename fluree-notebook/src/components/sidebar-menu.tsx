import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  DocumentDuplicateIcon,
  CodeBracketIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/20/solid';
import { Markdown } from './icons/markdown';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const SidebarMenu = ({
  id,
  setEditing,
  inputRef,
  deleteNotebook,
  exportJSON,
  exportMarkdown,
  children,
}: {
  id: string;
  setEditing: (val: boolean) => void;
  inputRef: any;
  deleteNotebook: (id: string) => void;
  exportJSON: (arr: Array<string>) => void;
  exportMarkdown: (arr: Array<string>) => void;
  children: any;
}) => {
  const activeClasses =
    'dark:bg-ui-neutral-800 bg-gray-100 text-gray-900 dark:text-white';
  const classes =
    'dark:bg-ui-neutral-900 text-gray-700 dark:text-[rgb(220,220,220)]';

  const editNotebookName = () => {
    setEditing(true);
    setTimeout(() => {
      inputRef.current.select();
    }, 100);
  };

  const duplicateNotebook = () => {
    let localState = JSON.parse(localStorage.getItem('notebookState'));
    let existingNames = localState.notebooks.map((p) => p.name);
    for (var i = 0; i < localState.notebooks.length; i++) {
      if (localState.notebooks[i].id === id) {
        let newNotebook = JSON.parse(JSON.stringify(localState.notebooks[i]));

        for (var i = 0; i < newNotebook.cells.length; i++) {
          delete newNotebook.cells[i].result;
          delete newNotebook.cells[i].resultStatus;
        }

        newNotebook.id = Math.random().toString(36).substring(7);

        let newName = newNotebook.name + ' Copy';
        let cachedName = newNotebook.name + ' Copy';

        let x = 1;
        while (existingNames.includes(newName)) {
          newName = cachedName + x;
          x++;
        }

        newNotebook.name = newName;
        localState.notebooks.splice(i + 1, 0, newNotebook);
        break;
      }
    }
    localStorage.setItem('notebookState', JSON.stringify(localState));
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <Menu
      as="div"
      className="relative inline-flex items-center justify-center text-left h-[100%] rounded-full mx-1"
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
          style={{ zIndex: 100000 }}
          className="absolute left-1 -top-1 mt-2 w-56 origin-top-right divide-y divide-gray-100 dark:divide-ui-neutral-800 rounded-md bg-white dark:bg-ui-neutral-900 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <div className="py-1 relative">
            <Menu.Item>
              {({ active }) => (
                <span
                  onClick={editNotebookName}
                  className={classNames(
                    active ? activeClasses : classes,
                    'group flex items-center px-4 py-2 text-sm'
                  )}
                >
                  <PencilSquareIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Rename
                </span>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <span
                  onClick={duplicateNotebook}
                  className={classNames(
                    active ? activeClasses : classes,
                    'group flex items-center px-4 py-2 text-sm'
                  )}
                >
                  <DocumentDuplicateIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Duplicate
                </span>
              )}
            </Menu.Item>
          </div>
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <span
                  onClick={() => exportJSON([id])}
                  className={classNames(
                    active ? activeClasses : classes,
                    'group flex items-center px-4 py-2 text-sm'
                  )}
                >
                  <CodeBracketIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Export JSON
                </span>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <span
                  onClick={() => exportMarkdown([id])}
                  className={classNames(
                    active ? activeClasses : classes,
                    'group flex items-center px-4 py-2 text-sm'
                  )}
                >
                  <Markdown
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Export Markdown
                </span>
              )}
            </Menu.Item>
          </div>
          {/* <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <a
                  href="#"
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'group flex items-center px-4 py-2 text-sm'
                  )}
                >
                  <ArchiveBoxIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Archive
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  href="#"
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'group flex items-center px-4 py-2 text-sm'
                  )}
                >
                  <ArrowRightCircleIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Move
                </a>
              )}
            </Menu.Item>
          </div>
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <a
                  href="#"
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'group flex items-center px-4 py-2 text-sm'
                  )}
                >
                  <UserPlusIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Share
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  href="#"
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'group flex items-center px-4 py-2 text-sm'
                  )}
                >
                  <HeartIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Add to favorites
                </a>
              )}
            </Menu.Item>
          </div> */}
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <span
                  onClick={() => deleteNotebook(id)}
                  className={classNames(
                    active ? activeClasses : classes,
                    'group flex items-center px-4 py-2 text-sm'
                  )}
                >
                  <TrashIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Delete
                </span>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default SidebarMenu;
