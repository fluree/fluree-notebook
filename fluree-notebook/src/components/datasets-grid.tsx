import { useState, useEffect } from 'react';
import ConnectionRow from './datasets-row';
import { Conn } from '../types';

const DatasetsGrid = () => {
  const [datasets, setDatasets] = useState(
    JSON.parse(localStorage.getItem('datasets') || '[]')
  );

  const addDataset = () => {
    const newDataset = {
      id: Math.random().toString(36).substring(7), // generate a unique id
      new: true,
      name: '',
      url: '',
      key: '',
      type: 'dataset',
    };
    setDatasets([...datasets, newDataset]);
  };

  const update = (value: string, index: number) => {
    let arr = JSON.parse(JSON.stringify(datasets));
    arr[index] = value;
    setDatasets(arr);
  };

  const remove = (index: number) => {
    let arr = JSON.parse(JSON.stringify(datasets));
    arr.splice(index, 1);
    setDatasets(arr);
  };

  useEffect(() => {
    localStorage.setItem('datasets', JSON.stringify(datasets));
  }, [datasets]);

  return (
    <div className="px-2 rounded-md">
      <div className="px-4 py-4 sm:grid sm:grid-cols-8 sm:gap-4 sm:px-0">
        <dt className="mt-1 text-sm leading-6 sm:mt-0">
          <h3 className="pl-1 text-lg font-semibold leading-7 text-gray-900 dark:text-ui-neutral-400">
            Dataset Name
          </h3>
        </dt>
        <dt className="mt-1 text-sm leading-6 sm:mt-0 sm:col-span-2">
          <h3 className="pl-1 text-lg font-semibold leading-7 text-gray-900 dark:text-ui-neutral-400">
            Connection String
          </h3>
        </dt>
        <dt className="mt-1 text-sm leading-6 sm:mt-0 sm:col-span-5">
          <h3 className="pl-1 text-lg font-semibold leading-7 text-gray-900 dark:text-ui-neutral-400">
            API Key
          </h3>
        </dt>
      </div>
      <div className="-mt-1 border-t border-ui-indigo-800">
        {datasets.length === 0 && (
          <span className="block px-2 py-2 my-[10px] font-mono text-black text-sm text-opacity-50">
            {'{ no datasets }'}
          </span>
        )}
        <dl className="divide-y divide-ui-indigo-800">
          {datasets.map((p: Conn, i: number) => (
            <ConnectionRow
              key={i}
              row={p}
              index={i}
              update={update}
              remove={remove}
            />
          ))}
        </dl>
      </div>
      <button
        onClick={addDataset}
        className="bg-ui-main-300 hover:bg-ui-main-400 dark:bg-ui-main-600 dark:hover:bg-ui-main-500 dark:text-[snow] rounded-md px-5 py-2 my-2 transition"
      >
        Add Dataset
      </button>
    </div>
  );
};

export default DatasetsGrid;
