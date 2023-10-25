import { Fragment, useRef, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';

import useGlobal from '../hooks/useGlobal';
import DatasetsGrid from './datasets-grid';
import InstancesGrid from './instances-grid';
import IconButton from './buttons/icon-button';
import ConnectionMenu from './conn-menu';

import { Cloud } from './icons/cloud';
import { Cube } from './icons/cube';
import { Globe } from './icons/globe';
import { XMark } from './icons/x-mark';

const SettingsModal = () => {
  const {
    state: { settingsOpen, defaultConn },
    dispatch,
  } = useGlobal();
  const closeSettings = () => dispatch({ type: 'settingsOpen', value: false });

  const cancelButtonRef = useRef(null);
  const [conn, setConn] = useState(JSON.parse(defaultConn));

  useEffect(() => {
    setConn(JSON.parse(defaultConn));
  }, [defaultConn]);

  return (
    <Transition.Root show={settingsOpen} as={Fragment}>
      <Dialog
        as="div"
        style={{ zIndex: 150000 }}
        className="relative"
        initialFocus={cancelButtonRef}
        onClose={closeSettings}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-[1000] w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative block transform rounded-lg bg-white dark:bg-ui-neutral-900 p-4 text-left shadow-xl transition-all w-[80vw] outline outline-ui-main-500">
                <div className="h-[calc(100%-65px)] p-2">
                  <div className="mt-1 block text-left">
                    <Dialog.Title
                      as="h2"
                      className="text-2xl font-semibold leading-6 text-gray-900 dark:text-ui-neutral-300 mb-6 py-2"
                    >
                      Connections
                      <div className="absolute right-3 top-4 rounded-full bg-ui-neutral-300 bg-opacity-5">
                        <IconButton onClick={closeSettings} size="lg">
                          <XMark />
                        </IconButton>
                      </div>
                    </Dialog.Title>
                    <div className="mt-2 block h-[calc(100%)]">
                      <h4 className="dark:text-[snow] font-semibold text-lg flex items-center">
                        <Cube
                          className={`mr-2 h-6 w-6 dark:text-ui-yellow-400 text-ui-yellow-400`}
                          aria-hidden="true"
                        />
                        Fluree Instances
                      </h4>
                      <InstancesGrid />
                      <h4 className="mt-5 dark:text-[snow] font-semibold text-lg flex items-center">
                        <Cloud
                          className={`mr-2 h-6 w-6 dark:text-ui-main-500 text-ui-main-500`}
                          aria-hidden="true"
                        />
                        Nexus Datasets
                      </h4>
                      <DatasetsGrid />
                      <h4 className="mt-5 dark:text-[snow] font-semibold text-lg flex items-center">
                        <Globe
                          className={`mr-2 h-6 w-6 dark:text-ui-green-500 text-ui-green-500`}
                          aria-hidden="true"
                        />
                        In-Memory Fluree
                      </h4>
                      <div className="dark:text-[snow] py-2 px-1 text-[16px]">
                        <div className="py-1">
                          Running Fluree in-memory uses the browser to run a
                          single transient ledger. Note that when using
                          in-memory Fluree:
                        </div>
                        <ul className="dark:text-[snow] list-disc ml-5">
                          <li>There is only one ledger</li>
                          <li>Nothing is written to disk</li>
                          <li>
                            The ledger state is lost when the browser page is
                            refreshed or closed
                          </li>
                          <li>
                            Ledger keys such as{' '}
                            <span className="font-mono inline-flex items-center justify-center dark:bg-gray-700 px-[3px] py-[1px] rounded-md text-[14px]">
                              f:ledger
                            </span>{' '}
                            and{' '}
                            <span className="font-mono inline-flex items-center justify-center dark:bg-gray-700 px-[3px] py-[1px] rounded-md text-[14px]">
                              from
                            </span>{' '}
                            are omitted from transactions/queries
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  style={{ zIndex: 150000 }}
                  className="dark:text-[white] py-3 px-6 flex items-center"
                >
                  For new notebooks, use:
                  <ConnectionMenu activeConnId={conn.id} position="above">
                    <div className="flex items-center ml-3 px-4 py-2 pl-[13px] rounded-md dark:hover:bg-gray-500 hover:bg-gray-200 bg-opacity-10 dark:bg-opacity-10 transition">
                      {conn.type === 'instance' && (
                        <Cube
                          className={`mr-[6px] -ml-[2px] -mb-[1px] h-5 w-5 dark:text-ui-yellow-400 text-ui-yellow-400 delay-200 transition 
                        `}
                          aria-hidden="true"
                        />
                      )}
                      {conn.type === 'dataset' && (
                        <Cloud
                          className={`mr-[6px] -mb-[1px] h-5 w-5 dark:text-ui-main-500 text-ui-main-500 delay-200 transition 
                        `}
                          aria-hidden="true"
                        />
                      )}
                      {conn.type === 'memory' && (
                        <Globe
                          className={`mr-[6px] -ml-[2px] -mb-[1px] h-5 w-5 dark:text-ui-green-500 text-ui-green-500 delay-200 transition 
                        `}
                          aria-hidden="true"
                        />
                      )}
                      <span className="-mr-1">{conn.name}</span>
                    </div>
                  </ConnectionMenu>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className={`bg-ui-main-300 hover:bg-ui-main-400 dark:bg-ui-main-600 dark:hover:bg-ui-main-500
                     dark:text-[snow] rounded-md px-5 py-2 transition mx-4 -mt-4 mb-4 text-lg`}
                    onClick={closeSettings}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default SettingsModal;
