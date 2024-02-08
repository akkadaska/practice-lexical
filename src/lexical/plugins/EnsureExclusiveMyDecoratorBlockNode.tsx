import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createTextNode,
  $getNodeByKey,
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
              nodeMutation === 'updated' || nodeMutation === 'created';
            if (isNewTextInputted) {
              const myBlockNodeList =
                $nodesOfType<MyBlockDecoratorNode>(MyBlockDecoratorNode);
              myBlockNodeList.forEach((myBlockNode) => {
                const replacedTextNode = $createTextNode(
                  myBlockNode.getTextContent(),
                );
                myBlockNode.replace(replacedTextNode);
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
