import { Fragment, useRef, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/24/outline';
import DatasetsGrid from './datasets-grid';
import InstancesGrid from './instances-grid';
import { XMarkIcon } from '@heroicons/react/20/solid';
import IconButton from './buttons/icon-button';
import { XMark } from './icons/x-mark';
import useGlobal from '../hooks/useGlobal';
import { Cube } from './icons/cube';
import { Cloud } from './icons/cloud';
import ConnectionMenu from './conn-menu';

export default function SettingsModal() {
  const {
    state: { settingsOpen, defaultConn },
    dispatch,
  } = useGlobal();
  const closeSettings = (val) =>
    dispatch({ type: 'settingsOpen', value: false });

  const cancelButtonRef = useRef(null);
  const [conn, setConn] = useState(JSON.parse(defaultConn));

  useEffect(() => {
    setConn(JSON.parse(defaultConn));
  }, [defaultConn]);

  return (
    <Transition.Root show={settingsOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[1000]"
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
                <div className="h-[calc(100%-65px)] p-3">
                  <div className="mt-1 block text-left">
                    <Dialog.Title
                      as="h2"
                      className="text-3xl font-semibold leading-6 text-gray-900 dark:text-ui-neutral-300 mb-6 py-2"
                    >
                      Connections
                      <div className="absolute right-3 top-3 rounded-full bg-ui-neutral-300 bg-opacity-5">
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
                    </div>
                  </div>
                </div>
                <div className="dark:text-[white] py-3 px-6 z-[1000] flex items-center">
                  For new notebooks, use:
                  <ConnectionMenu activeConnId={conn.id}>
                    <div className="flex items-center px-4 py-2 ml-3 pl-[13px] rounded-md dark:hover:bg-gray-500 hover:bg-gray-200 bg-opacity-10 dark:bg-opacity-10 transition">
                      {conn.type === 'instance' && (
                        <Cube
                          className={`mr-[6px] -ml-[2px] -mb-[1px] h-5 w-5 dark:text-ui-yellow-400 text-ui-yellow-400 delay-200 transition 
                        `}
                          aria-hidden="true"
                        />
                      )}
                      {conn.type === 'dataset' && (
                        <Cloud
                          className={`mr-[6px] -ml-[2px] -mb-[1px] h-5 w-5 dark:text-ui-main-500 text-ui-main-500 delay-200 transition 
                        `}
                          aria-hidden="true"
                        />
                      )}
                      <span className="-mb-[3px]">{conn.name}</span>
                    </div>
                  </ConnectionMenu>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className={`bg-ui-main-300 hover:bg-ui-main-400 dark:bg-ui-main-600 dark:hover:bg-ui-main-500
                     dark:text-[snow] rounded-md px-8 py-3 transition mx-4 -mt-4 mb-4 text-xl`}
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
}
