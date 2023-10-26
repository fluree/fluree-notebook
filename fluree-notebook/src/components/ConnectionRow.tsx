import { useState, useEffect, useRef, KeyboardEvent, MouseEvent } from 'react';
import IconButton from './buttons/IconButton';
import { Conn } from '../types';

import { Check } from './icons/Check';
import { Delete } from './icons/Delete';
import { PencilSquare } from './icons/PencilSquare';
import { XMark } from './icons/Xmark';

const ConnectionRow = ({
  row,
  index,
  update,
  remove,
}: {
  row: Conn;
  index: number;
  update: (value: any, index: number) => void;
  remove: (index: number) => void;
}) => {
  const [editing, setEditing] = useState(row.new ? true : false);
  const [name, setName] = useState(row.name);
  const [url, setUrl] = useState(row.url);
  const [key, setKey] = useState(row.key);
  const [deleteRow, setDeleteRow] = useState(false);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const urlRef = useRef<HTMLInputElement | null>(null);
  const keyRef = useRef<HTMLInputElement | null>(null);
  const keyObscuredRef = useRef<HTMLInputElement | null>(null);

  const startEditing = () => {
    setEditing(true);
  };

  useEffect(() => {
    if (nameRef.current && urlRef.current) {
      nameRef.current.value = row.name;
      urlRef.current.value = row.url;
    }
    if (keyRef.current && row.key) {
      (keyRef.current as HTMLInputElement).value = row.key;
    }
    if (keyObscuredRef.current && row.key) {
      keyObscuredRef.current.value =
        row.key.substring(0, 5) + '*'.repeat(row.key.length - 5);
    }
  }, [index, row.name, row.url, row.key]);

  const stopEditing = () => {
    if (!name && !url && !key) {
      remove(index);
    } else {
      update(
        // @ts-ignore
        {
          id: row.id,
          name,
          url,
          key,
          type: row.type,
        },
        index
      );
    }
    setEditing(false);
    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
    }, 200);
  };

  const removeDataset = () => {
    setDeleteRow(false);
    remove(index);
  };

  const handleDoubleClick = (e: MouseEvent) => {
    if (editing) {
      stopEditing();
    } else {
      startEditing();
    }
    setTimeout(() => {
      // @ts-ignore
      if (e.target.dataset.name === 'key-obscured') {
        keyRef?.current?.focus();
      } else {
        // @ts-ignore
        e.target.focus();
      }
    }, 5);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
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
    if (keyRef.current && row.key) {
      setKey(row.key);
      keyRef.current.value = row.key;
    }
    setEditing(false);
  };

  const obscuredKey = () => {
    if (row.key) {
      return row.key?.substring(0, 5) + '*'.repeat(row.key.length - 5);
    } else {
      return '';
    }
  };

  useEffect(() => {
    if (nameRef.current) {
      nameRef.current.focus();
    }
  }, [editing]);

  return (
    <div className="px-4 py-2 sm:grid sm:grid-cols-8 sm:gap-4 sm:px-0 font-mono flex items-center">
      <dd
        onDoubleClick={handleDoubleClick}
        className="font-medium leading-6 text-gray-900 dark:text-gray-300"
      >
        <input
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={(e) => e.target.select()}
          ref={nameRef}
          defaultValue={name}
          disabled={!editing}
          className={`bg-opacity-0 bg-white outline-none dark:bg-opacity-0 dark:bg-black w-[100%] px-2 py-1 rounded-md focus:ring-0 active:ring-0 ring-0 border-none text-sm
          ${
            editing
              ? 'dark:bg-gray-800 dark:bg-opacity-100 bg-gray-300 bg-opacity-100'
              : ''
          }`}
          placeholder={editing ? 'Name' : '(empty)'}
        />
      </dd>
      <dd
        onDoubleClick={handleDoubleClick}
        className="mt-1 leading-6 text-gray-900 dark:text-gray-300 sm:col-span-2 sm:mt-0"
      >
        <input
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={(e) => e.target.select()}
          ref={urlRef}
          onDoubleClick={handleDoubleClick}
          defaultValue={url}
          disabled={!editing}
          className={`bg-opacity-0 bg-white outline-none dark:bg-opacity-0 dark:bg-black w-[100%] px-2 py-1 rounded-md focus:ring-0 active:ring-0 ring-0 border-none text-sm
          ${
            editing
              ? 'dark:bg-gray-800 dark:bg-opacity-100 bg-gray-300 bg-opacity-100'
              : ''
          }`}
          placeholder={editing ? 'Connection URL' : '(empty)'}
        />
      </dd>
      <dd
        onDoubleClick={handleDoubleClick}
        className="mt-1 leading-6 text-gray-900 dark:text-gray-300 sm:col-span-4 sm:mt-0"
      >
        {(key === '' || key) && !editing && (
          <input
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={(e) => e.target.select()}
            ref={keyObscuredRef}
            onDoubleClick={handleDoubleClick}
            data-name="key-obscured"
            defaultValue={obscuredKey()}
            disabled={!editing}
            className={`bg-opacity-0 bg-white outline-none dark:bg-opacity-0 dark:bg-black w-[100%] px-2 py-1 rounded-md focus:ring-0 active:ring-0 ring-0 border-none text-sm
            ${
              editing
                ? 'dark:bg-gray-800 dark:bg-opacity-100 bg-gray-300 bg-opacity-100'
                : ''
            }`}
            placeholder={editing ? 'API Key' : '(empty)'}
          />
        )}
        {(key === '' || key) && editing && (
          <input
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={(e) => e.target.select()}
            ref={keyRef}
            onDoubleClick={handleDoubleClick}
            data-name="key"
            defaultValue={key}
            disabled={!editing}
            className={`bg-opacity-0 bg-white outline-none dark:bg-opacity-0 dark:bg-black w-[100%] px-2 py-1 rounded-md focus:ring-0 active:ring-0 ring-0 border-none text-sm
            ${
              editing
                ? 'dark:bg-gray-800 dark:bg-opacity-100 bg-gray-300 bg-opacity-100'
                : ''
            }`}
            placeholder={editing ? 'API Key' : '(empty)'}
          />
        )}
      </dd>
      <dd className="mt-1 leading-6 text-gray-900 dark:text-gray-300 sm:col-span-1 sm:mt-0">
        <div className="flex justify-center items-center">
          {deleteRow && (
            <div className="relative flex justify-center items-center">
              <div className="flex absolute right-full w-[160px] justify-end text-xs pr-3">
                Confirm Delete:
              </div>
              <IconButton tooltip="Cancel" onClick={() => setDeleteRow(false)}>
                <XMark />
              </IconButton>
              <IconButton tooltip="Yes, Delete" onClick={removeDataset}>
                <Check />
              </IconButton>
            </div>
          )}
          {!editing && !deleteRow && (
            <div className="flex justify-center items-center">
              <IconButton onClick={startEditing} tooltip="Edit Details">
                <PencilSquare />
              </IconButton>
              <IconButton
                onClick={() => setDeleteRow(true)}
                tooltip={`Remove ${
                  row.type === 'dataset' ? 'Dataset' : 'Instance'
                }`}
              >
                <Delete />
              </IconButton>
            </div>
          )}
          {editing && !deleteRow && (
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
