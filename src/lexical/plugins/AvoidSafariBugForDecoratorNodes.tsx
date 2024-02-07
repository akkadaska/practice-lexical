import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey, $isTextNode, $nodesOfType, TextNode } from 'lexical';
import { useEffect } from 'react';
import { $isMyBlockDecoratorNode, MyBlockDecoratorNode } from '../node';

/**
 * Safariのバグを回避するためのプラグイン
 */
const AvoidSafariBugForDecoratorNodesPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    const removeTextNodeMutationListener = editor.registerMutationListener(
      TextNode,
      (mutatedNodes) => {
        mutatedNodes.forEach((nodeMutation, nodeKey) => {
          if (nodeMutation === 'updated') {
            editor.update(() => {
              const targetTextNode = $getNodeByKey<TextNode>(nodeKey);

              // `TextNode` が存在しない場合は何もしない
              if (!targetTextNode) {
                return;
              }

              // `TextNode` の前のノードが `MyBlockDecoratorNode` でない場合は何もしない
              const leadingNode = targetTextNode?.getPreviousSibling();
              if (!$isMyBlockDecoratorNode(leadingNode)) {
                return;
              }

              const targetTextNodeText = targetTextNode.getTextContent();

              // updateの結果、`TextNode` の先頭がスペースではない場合は`TextNode` の先頭にスペースを削除し、`MyBlockDecoratorNode` を削除する
              if (!targetTextNodeText.startsWith(' ')) {
                targetTextNode.setTextContent(targetTextNodeText.slice(1));
                leadingNode.remove();
                return;
              }
            });
          } else if (nodeMutation === 'destroyed') {
            editor.update(() => {
              const myBlockNodeList =
                $nodesOfType<MyBlockDecoratorNode>(MyBlockDecoratorNode);
              myBlockNodeList.forEach((myBlockNode) => {
                const trailingNode = myBlockNode.getNextSibling();

                if ($isTextNode(trailingNode)) {
                  const trailingNodeText = trailingNode.getTextContent();
                  if (!trailingNodeText.startsWith(' ')) {
                    trailingNode.setTextContent(` ${trailingNodeText}`);
                  }
                } else {
                  myBlockNode.remove();
                }
              });
            });
          }
        });
      },
    );

    const removeMyBlockDecoratorNodeMutationListener =
      editor.registerMutationListener(MyBlockDecoratorNode, (mutatedNodes) => {
        mutatedNodes.forEach((nodeMutation) => {
          if (nodeMutation === 'destroyed') {
            editor.update(() => {
              const textNodes = $nodesOfType<TextNode>(TextNode);
              textNodes.forEach((textNode) => {
                const textNodeText = textNode.getTextContent();
                const previousSibling = textNode.getPreviousSibling();
                if (previousSibling) {
                  return;
                }
                if (textNodeText === ' ') {
                  textNode.remove();
                } else if (textNodeText.startsWith(' ')) {
                  textNode.setTextContent(textNodeText.slice(1));
                }
              });
            });
          }
        });
      });

    return () => {
      removeTextNodeMutationListener();
      removeMyBlockDecoratorNodeMutationListener();
    };
  }, [editor]);

  return null;
};

export default AvoidSafariBugForDecoratorNodesPlugin;
