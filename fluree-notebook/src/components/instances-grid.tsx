import { useState, useEffect } from 'react';
import ConnectionRow from './datasets-row';

const InstancesGrid = () => {
  const [instances, setInstances] = useState(
    JSON.parse(localStorage.getItem('instances'))
  );

  const addInstance = () => {
    const newInstance = {
      id: Math.random().toString(36).substring(7), // generate a unique id
      new: true,
      name: '',
      url: '',
      type: 'instance',
      //   key: '',
    };
    setInstances([...instances, newInstance]);
  };

  const update = (value, index) => {
    let arr = JSON.parse(JSON.stringify(instances));
    arr[index] = value;
    setInstances(arr);
  };

  const remove = (index) => {
    let arr = JSON.parse(JSON.stringify(instances));

    let connToRemove = JSON.stringify(arr[index]);
    let defaultConn = localStorage.getItem('defaultConn');

    arr.splice(index, 1);
    setInstances(arr);

    if (defaultConn === connToRemove) {
      if (arr.length > 0) {
        localStorage.setItem('defaultConn', JSON.stringify(instances[0]));
      } else {
        localStorage.setItem('defaultConn', '{"name":"{ no instances }"}');
      }
    }
  };

  useEffect(() => {
    console.log(instances);
    localStorage.setItem('instances', JSON.stringify(instances));
  }, [instances]);

  return (
    <div className="px-2 rounded-md">
      <div className="px-4 py-4 sm:grid sm:grid-cols-8 sm:gap-4 sm:px-0">
        <dt className="mt-1 text-sm leading-6 sm:mt-0">
          <h3 className="pl-1 text-lg font-semibold leading-7 text-gray-900 dark:text-ui-neutral-400">
            Instance Name
          </h3>
        </dt>
        <dt className="mt-1 text-sm leading-6 sm:mt-0 sm:col-span-2">
          <h3 className="pl-1 text-lg font-semibold leading-7 text-gray-900 dark:text-ui-neutral-400">
            Connection String
          </h3>
        </dt>
      </div>

      <div className="-mt-1 border-t border-ui-main-800">
        {instances.length === 0 && (
          <span className="block px-2 py-2 my-[10px] font-mono text-black text-sm text-opacity-50">
            {'{ no instances }'}
          </span>
        )}
        <dl className="divide-y divide-ui-main-800">
          {instances.map((p, i) => (
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
        onClick={addInstance}
        className={`bg-ui-main-300 hover:bg-ui-main-400 dark:bg-ui-main-600 dark:hover:bg-ui-main-500 dark:text-[snow] 
      rounded-md px-5 py-2 my-2 transition`}
      >
        Add Instance
      </button>
    </div>
  );
};

export default InstancesGrid;
