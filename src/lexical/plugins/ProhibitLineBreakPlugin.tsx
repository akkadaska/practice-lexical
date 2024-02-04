import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LineBreakNode } from 'lexical';
import React, { useEffect } from 'react';

/**
 * Lexicalエディタ内で改行を禁止し、input[type="text"]のようにふるまうようにするプラグイン
 */
const ProhibitLineBreakPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const removeUpdateListener = editor.registerNodeTransform(
      LineBreakNode,
      (lineBreakNode) => {
        lineBreakNode.remove();
      },
    );

    return () => {
      removeUpdateListener();
    };
  }, [editor]);

  return null;
};

export default ProhibitLineBreakPlugin;
