import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import vsDark from 'react-syntax-highlighter/dist/esm/styles/prism/vs-dark.js';
import codeblockTheme from './codeblockTheme';
import IconButton from './components/buttons/icon-button';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Clipboard } from './components/icons/clipboard';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { Check } from './components/icons/check';

const CodeBlock = ({ language, value }) => {
  const [hover, setHover] = useState(false);
  const [copied, setCopied] = useState(false);
  const notify = () => {
    toast('Copied!', {
      position: 'bottom-left',
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      className: 'bg-ui-green-600 text-white',
    });
  };

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
      <div className="absolute top-2 right-2" name="codeblock-toolbar">
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
