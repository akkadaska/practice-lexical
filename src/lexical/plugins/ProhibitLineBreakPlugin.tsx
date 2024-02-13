import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LineBreakNode } from 'lexical';
import React, { useEffect } from 'react';

/**
 * Lexicalエディタ内で改行を禁止し、input[type="text"]のようにふるまうようにするプラグイン
 */
const ProhibitLineBreakPlugin: React.FC<{
  onInputComplete?: () => unknown;
}> = ({ onInputComplete }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const removeUpdateListener = editor.registerNodeTransform(
      LineBreakNode,
      (lineBreakNode) => {
        lineBreakNode.remove();
        onInputComplete && onInputComplete();
      },
    );

    return () => {
      removeUpdateListener();
    };
  }, [editor, onInputComplete]);

  return null;
};

export default ProhibitLineBreakPlugin;
