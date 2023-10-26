import { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import IconButton from './components/buttons/IconButton';
import { Clipboard } from './components/icons/Clipboard';
import { Check } from './components/icons/Check';

// @ts-ignore
import codeblockTheme from './codeblockTheme';

const CodeBlock = ({
  language,
  value,
}: {
  language: string;
  value: string;
}) => {
  const [hover, setHover] = useState(false);
  const [copied, setCopied] = useState(false);

  const indicateCopied = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="absolute top-2 right-2" data-name="codeblock-toolbar">
        {copied && (
          <CopyToClipboard text={value} onCopy={indicateCopied}>
            <IconButton
              size="sm"
              tooltip="Copied!"
              distance={14}
              position="left"
              className={`transition ${hover ? 'opacity-100' : 'opacity-0'}`}
            >
              <Check />
            </IconButton>
          </CopyToClipboard>
        )}
        {!copied && (
          <CopyToClipboard text={value} onCopy={indicateCopied}>
            <IconButton
              size="sm"
              tooltip="Copy Code"
              distance={14}
              position="left"
              className={`transition ${hover ? 'opacity-100' : 'opacity-0'}`}
            >
              <Clipboard />
            </IconButton>
          </CopyToClipboard>
        )}
      </div>
      <SyntaxHighlighter style={codeblockTheme} language={language}>
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
