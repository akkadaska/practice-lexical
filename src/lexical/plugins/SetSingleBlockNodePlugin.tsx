import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createParagraphNode,
  $getRoot,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  createCommand,
} from 'lexical';
import React, { useEffect } from 'react';
import { $createMyBlockNode } from '../node';

const SET_SINGLE_BLOCK_COMMAND = createCommand<{
  text: string;
  blockInfo: string;
}>('SET_SINGLE_BLOCK_COMMAND');

const SetSingleBlockNodePlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const unregisterCommand = editor.registerCommand(
      SET_SINGLE_BLOCK_COMMAND,
      ({ text, blockInfo }) => {
        editor.update(() => {
          $getRoot().clear();
          $setSelection(null);

          const paragraphNode = $createParagraphNode();

          const blockNode = $createMyBlockNode(text, blockInfo);

          paragraphNode.append(blockNode);
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

export default SetSingleBlockNodePlugin;
export { SET_SINGLE_BLOCK_COMMAND };
