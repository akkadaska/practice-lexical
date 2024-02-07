import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createTextNode,
  $getNodeByKey,
  $isTextNode,
  $nodesOfType,
  TextNode,
} from 'lexical';
import { useEffect } from 'react';
import { MyBlockDecoratorNode } from '../node';

/**
 * `MyBlockDecoratorNode` が他のノードと共存しないようにするプラグイン
 * ユーザーの入力により`TextNode`が新規に作成されたとき、もし`MyBlockDecoratorNode`が存在していたら、それを`TextNode`に置き換える
 */
const EnsureExclusiveMyDecoratorBlockNodePlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    const removeUpdateListener = editor.registerMutationListener(
      TextNode,
      (mutatedNodes) => {
        mutatedNodes.forEach((nodeMutation, nodeKey) => {
          editor.update(() => {
            const currentTextNode = $getNodeByKey<TextNode>(nodeKey);
            if (!currentTextNode) {
              return;
            }
            const isNewTextInputted =
              nodeMutation === 'updated' ||
              (nodeMutation === 'created' &&
                currentTextNode.getTextContent() !== ' ');
            if (isNewTextInputted) {
              const myBlockNodeList =
                $nodesOfType<MyBlockDecoratorNode>(MyBlockDecoratorNode);
              myBlockNodeList.forEach((myBlockNode) => {
                const nextSibling = myBlockNode.getNextSibling();
                const replacedTextNode = $createTextNode(
                  myBlockNode.getTextContent(),
                );
                myBlockNode.replace(replacedTextNode);

                const nextSiblingText = nextSibling?.getTextContent();
                if (
                  $isTextNode(nextSibling) &&
                  nextSiblingText?.startsWith(' ')
                ) {
                  nextSibling?.setTextContent(nextSiblingText.slice(1));
                  currentTextNode.selectEnd();
                }
              });
            }
          });
        });
      },
    );

    return () => {
      removeUpdateListener();
    };
  }, [editor]);

  return null;
};

export default EnsureExclusiveMyDecoratorBlockNodePlugin;
