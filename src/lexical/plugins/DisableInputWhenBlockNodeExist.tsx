import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createTextNode, $nodesOfType, TextNode } from 'lexical';
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
        mutatedNodes.forEach((nodeMutation, _nodeKey) => {
          if (nodeMutation === 'destroyed') {
            return;
          }
          editor.getEditorState().read(() => {
            const myBlockNodeList =
              $nodesOfType<MyBlockDecoratorNode>(MyBlockDecoratorNode);
            if (myBlockNodeList.length > 0) {
              onInvalidInput();
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
          onInvalidInput();
        }
      },
    );

    return () => {
      removeUpdateListener();
      removeTextNodeTransform();
    };
  }, [editor, onInvalidInput]);

  return null;
};

export default DisableInputWhenBlockNodeExist;
