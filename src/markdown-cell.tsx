import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownCell: React.FC<{
  value: string;
  onChange: (newValue: string) => void;
}> = ({ value, onChange }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  return isEditing ? (
    <div className="markdown-cell editing flex flex-col p-8">
      <textarea
        className="h-64"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        className="self-start m-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => setIsEditing(false)}
      >
        Save
      </button>
    </div>
  ) : (
    <div className="markdown-cell" onClick={() => setIsEditing(true)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose">
        {value}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownCell;
