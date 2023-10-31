import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Notebook } from '../types';

import {
  DocumentDuplicateIcon,
  CodeBracketIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/20/solid';

import { Markdown } from './icons/Markdown';
import { Refresh } from './icons/Refresh';

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

  // this is just a hidden test feature for updating old cookbook syntax
  const updateSyntax = () => {
    let localState = JSON.parse(localStorage.getItem('notebookState') || '[]');
    const thisNotebook = localState.notebooks.find(
      (notebook: any) => notebook.id === id
    );
    const thisIndex = localState.notebooks.findIndex(
      (notebook: any) => notebook.id === id
    );

    for (var i = 0; i < thisNotebook.cells.length; i++) {
      let newValue = {};
      let cell = thisNotebook.cells[i];
      if (cell.type === 'monaco' && cell.language === 'json') {
        let value = JSON.parse(cell.value);
        if (value.query) {
          // @ts-ignore
          newValue.from = value.ledger;
          let oldQuery = { ...value.query };
          newValue = {
            ...newValue,
            ...oldQuery,
          };
          thisNotebook.cells[i].value = JSON.stringify(newValue, null, 2);
        } else if (value.txn) {
          // @ts-ignore
          newValue['f:ledger'] = value.ledger;
          // if txn contains @graph
          if (value['@context']) {
            // @ts-ignore
            newValue['@context'] = value['@context'];
          }
          if (value.defaultContext) {
            // @ts-ignore
            newValue['f:defaultContext'] = value.defaultContext;
            // @ts-ignore
            if (!newValue['f:defaultContext']['f']) {
              // @ts-ignore
              newValue['f:defaultContext']['f'] = 'https://ns.flur.ee/ledger#';
            }
          }
          if (value.txn['@graph']) {
            // @ts-ignore
            newValue['@graph'] = value.txn['@graph'];
          } else {
            // @ts-ignore
            newValue['@graph'] = [{ ...value.txn }];
          }
          thisNotebook.cells[i].value = JSON.stringify(newValue, null, 2);
        } else if (!value.from && !value['f:ledger']) {
          thisNotebook.cells[i].deleteMe = true;
        }
        //   '@context': {
        //     f: 'https://ns.flur.ee/ledger#',
        //   },
        //   'f:defaultContext': {
        //     id: '@id',
        //     type: '@type',
        //     xsd: 'http://www.w3.org/2001/XMLSchema#',
        //     rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        //     rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
        //     sh: 'http://www.w3.org/ns/shacl#',
        //     schema: 'http://schema.org/',
        //     skos: 'http://www.w3.org/2008/05/skos#',
        //     wiki: 'https://www.wikidata.org/wiki/',
        //     f: 'https://ns.flur.ee/ledger#',
        //     ex: 'http://example.org/',
        //   },
      }
    }

    thisNotebook.cells = thisNotebook.cells.filter(
      // @ts-ignore
      (obj: Notebook) => obj.deleteMe !== true
    );

    // if it has 'alias' key, should it be deleted?
    // if the name is "cookbook" and md cell has "response" in it, delete the cell
    // and the following monaco cell

    localState.notebooks.splice(thisIndex, 1, thisNotebook);

    localStorage.setItem('notebookState', JSON.stringify(localState));
    window.dispatchEvent(new Event('storage'));
  };

  const duplicateNotebook = () => {
    let localState = JSON.parse(localStorage.getItem('notebookState') || '[]');
    let existingNames = localState.notebooks.map((p: Notebook) => p.name);
    for (var i = 0; i < localState.notebooks.length; i++) {
      if (localState.notebooks[i].id === id) {
        let newNotebook = JSON.parse(JSON.stringify(localState.notebooks[i]));

        for (var i = 0; i < newNotebook.cells.length; i++) {
          delete newNotebook.cells[i].result;
          delete newNotebook.cells[i].resultStatus;
        }

        newNotebook.id = `f${Math.random().toString(36).substring(2, 11)}`;

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
                  className={`${
                    active ? activeClasses : classes
                  } group flex items-center px-4 py-2 text-sm`}
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
                  className={`${
                    active ? activeClasses : classes
                  } group flex items-center px-4 py-2 text-sm`}
                >
                  <DocumentDuplicateIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Duplicate
                </span>
              )}
            </Menu.Item>
            {localStorage.getItem('admin') && (
              <Menu.Item>
                {({ active }) => (
                  <span
                    onClick={updateSyntax}
                    className={`${
                      active ? activeClasses : classes
                    } group flex items-center px-4 py-2 text-sm`}
                  >
                    <Refresh
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                    Update Syntax
                  </span>
                )}
              </Menu.Item>
            )}
          </div>
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <span
                  onClick={() => exportJSON([id])}
                  className={`${
                    active ? activeClasses : classes
                  } group flex items-center px-4 py-2 text-sm`}
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
                  className={`${
                    active ? activeClasses : classes
                  } group flex items-center px-4 py-2 text-sm`}
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
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <span
                  onClick={() => deleteNotebook(id)}
                  className={`${
                    active ? activeClasses : classes
                  } group flex items-center px-4 py-2 text-sm`}
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
