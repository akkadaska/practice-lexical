import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createTextNode,
  $getNodeByKey,
  $nodesOfType,
  COMMAND_PRIORITY_LOW,
  KEY_DOWN_COMMAND,
  TextNode,
} from 'lexical';
import { useEffect } from 'react';
import { MyBlockDecoratorNode } from '../node';
import { ZERO_WIDTH_CHARACTER } from './ZeroWidthNode';

/**
 * `MyBlockDecoratorNode` が他のノードと共存しないようにするプラグイン
 * ユーザーの入力により`TextNode`が新規に作成されたとき、もし`MyBlockDecoratorNode`が存在していたら、入力を無効にする
 */
const DisableInputWhenBlockNodeExist: React.FC<{
  onInvalidInput: () => unknown;
}> = ({ onInvalidInput }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    const removeUpdateListener = editor.registerMutationListener(
      TextNode,
      (mutatedNodes) => {
        mutatedNodes.forEach((nodeMutation, nodeKey) => {
          if (nodeMutation !== 'created') {
            return;
          }
          editor.update(() => {
            const currentTextNode = $getNodeByKey<TextNode>(nodeKey);
            if (!currentTextNode) {
              return;
            }
            const myBlockNodeList =
              $nodesOfType<MyBlockDecoratorNode>(MyBlockDecoratorNode);
            if (myBlockNodeList.length > 0) {
              // onInvalidInput();
            }
          });
        });
      },
    );

    const removeTextNodeTransform = editor.registerNodeTransform(
      TextNode,
      (node) => {
        if (
          node.getTextContent() === '' ||
          node.getTextContent().startsWith(ZERO_WIDTH_CHARACTER)
        ) {
          return;
        }
        const myBlockNodeList =
          $nodesOfType<MyBlockDecoratorNode>(MyBlockDecoratorNode);
        if (myBlockNodeList.length > 0) {
          const newTextNode = $createTextNode('');
          node.insertAfter(newTextNode);
          newTextNode.selectEnd();
          node.remove();
        }
      },
    );

    const unregisterCommand = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event) => {
        if (event.key === 'Enter') {
          console.log('Enter');
          return false;
        }
        const myBlockNodeList =
          $nodesOfType<MyBlockDecoratorNode>(MyBlockDecoratorNode);
        if (myBlockNodeList.length > 0) {
          onInvalidInput();
        }
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    return () => {
      removeUpdateListener();
      removeTextNodeTransform();
      unregisterCommand();
    };
  }, [editor, onInvalidInput]);

  return null;
};

export default DisableInputWhenBlockNodeExist;
