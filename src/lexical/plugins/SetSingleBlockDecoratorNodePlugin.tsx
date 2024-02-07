import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  createCommand,
} from 'lexical';
import React, { useEffect } from 'react';
import { $createMyBlockDecoratorNode } from '../node';

const SET_SINGLE_DECORATOR_BLOCK_COMMAND = createCommand<{
  text: string;
  blockInfo: string;
}>('SET_SINGLE_DECORATOR_BLOCK_COMMAND');

const SetSingleBlockDecoratorNodePlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const unregisterCommand = editor.registerCommand(
      SET_SINGLE_DECORATOR_BLOCK_COMMAND,
      ({ text, blockInfo }) => {
        editor.update(() => {
          $getRoot().clear();
          $setSelection(null);

          const paragraphNode = $createParagraphNode();

          const blockNode = $createMyBlockDecoratorNode(text, blockInfo);

          const trailingSpaceNode = $createTextNode(' ');

          paragraphNode.append(blockNode, trailingSpaceNode);
          $getRoot().append(paragraphNode);
        });

        return true;
      },
      COMMAND_PRIORITY_LOW,
    );

    return unregisterCommand;
  }, [editor]);
  return null;
};

export default SetSingleBlockDecoratorNodePlugin;
export { SET_SINGLE_DECORATOR_BLOCK_COMMAND };
