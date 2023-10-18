import { useState, useEffect, useRef } from 'react';
import IconButton from './buttons/icon-button';
import { PencilSquare } from './icons/pencil-square';
import { Delete } from './icons/delete';
import { Check } from './icons/check';
import { XMark } from './icons/x-mark';

const ConnectionRow = ({ row, index, update, remove }) => {
  const [editing, setEditing] = useState(row.new ? true : false);
  const [name, setName] = useState(row.name);
  const [url, setUrl] = useState(row.url);
  const [key, setKey] = useState(row.key);
  const nameRef = useRef();
  const urlRef = useRef();
  const keyRef = useRef();

  const startEditing = () => {
    setEditing(true);
  };

  useEffect(() => {
    if (nameRef.current && urlRef.current) {
      nameRef.current.value = row.name;
      urlRef.current.value = row.url;
    }
    if (keyRef.current) {
      keyRef.current.value = row.key;
    }
  }, [index, row.name, row.url, row.key]);

  const stopEditing = () => {
    update(
      {
        id: row.id,
        name,
        url,
        key,
        type: row.type,
      },
      index
    );
    setEditing(false);
    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
    }, 200);
  };

  const removeDataset = () => {
    remove(index);
  };

  const handleDoubleClick = (e) => {
    if (editing) {
      stopEditing();
    } else {
      startEditing();
    }
    setTimeout(() => {
      e.target.focus();
    }, 5);
  };

  const handleKeyDown = (e) => {
    if (e.code === 'Escape') {
      e.preventDefault();
      cancelEdit();
    } else if (e.code === 'Enter') {
      e.preventDefault();
      stopEditing();
    }
  };

  const cancelEdit = () => {
    if (nameRef.current && urlRef.current) {
      setName(row.name);
      setUrl(row.url);
      nameRef.current.value = row.name;
      urlRef.current.value = row.url;
    }
    if (keyRef.current) {
      setKey(row.key);
      keyRef.current.value = row.key;
    }
    setEditing(false);
  };

  useEffect(() => {
    if (nameRef.current) {
      nameRef.current.focus();
    }
  }, [editing]);

  return (
    <div className="px-4 py-3 sm:grid sm:grid-cols-8 sm:gap-4 sm:px-0 font-mono">
      <dd
        onDoubleClick={handleDoubleClick}
        className="text-sm font-medium leading-6 text-gray-900 dark:text-gray-300"
      >
        <input
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={(e) => e.target.select()}
          ref={nameRef}
          defaultValue={name}
          disabled={!editing}
          className={`bg-opacity-0 bg-white outline-none dark:bg-opacity-0 dark:bg-black w-[100%] px-2 py-1 rounded-md
          ${
            editing
              ? 'dark:bg-gray-800 dark:bg-opacity-100 bg-gray-200 bg-opacity-100'
              : ''
          }`}
          placeholder={editing ? 'Name' : '(empty)'}
        />
      </dd>
      <dd
        onDoubleClick={handleDoubleClick}
        className="mt-1 text-sm leading-6 text-gray-900 dark:text-gray-300 sm:col-span-2 sm:mt-0"
      >
        <input
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={(e) => e.target.select()}
          ref={urlRef}
          onDoubleClick={handleDoubleClick}
          defaultValue={url}
          disabled={!editing}
          className={`bg-opacity-0 bg-white outline-none dark:bg-opacity-0 dark:bg-black w-[100%] px-2 py-1 rounded-md
          ${
            editing
              ? 'dark:bg-gray-800 dark:bg-opacity-100 bg-gray-200 bg-opacity-100'
              : ''
          }`}
          placeholder={editing ? 'Connection URL' : '(empty)'}
        />
      </dd>
      <dd
        onDoubleClick={handleDoubleClick}
        className="mt-1 text-sm leading-6 text-gray-900 dark:text-gray-300 sm:col-span-4 sm:mt-0"
      >
        {(key === '' || key) && (
          <input
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={(e) => e.target.select()}
            ref={keyRef}
            onDoubleClick={handleDoubleClick}
            defaultValue={key}
            disabled={!editing}
            className={`bg-opacity-0 bg-white outline-none dark:bg-opacity-0 dark:bg-black w-[100%] px-2 py-1 rounded-md
            ${
              editing
                ? 'dark:bg-gray-800 dark:bg-opacity-100 bg-gray-200 bg-opacity-100'
                : ''
            }`}
            placeholder={editing ? 'API Key' : '(empty)'}
          />
        )}
      </dd>
      <dd className="mt-1 text-sm leading-6 text-gray-900 dark:text-gray-300 sm:col-span-1 sm:mt-0">
        <div className="flex justify-center items-center">
          {!editing && (
            <div className="flex justify-center items-center">
              <IconButton onClick={startEditing} tooltip="Edit Details">
                <PencilSquare />
              </IconButton>
              <IconButton onClick={removeDataset} tooltip="Remove Dataset">
                <Delete />
              </IconButton>
            </div>
          )}
          {editing && (
            <div className="flex justify-center items-center">
              <IconButton tooltip="Cancel" onClick={cancelEdit}>
                <XMark />
              </IconButton>
              <IconButton tooltip="Done Editing" onClick={stopEditing}>
                <Check />
              </IconButton>
            </div>
          )}
        </div>
      </dd>
    </div>
  );
};

export default ConnectionRow;
