import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getNodeByKey,
  $nodesOfType,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  TextNode,
  createCommand,
} from 'lexical';
import { useEffect } from 'react';
import { $createMyBlockDecoratorNode } from '../node';

const MODIFY_SPACE_SPLIT = createCommand<void>('MODIFY_SPACE_SPLIT');

const SpaceSplitBlockPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const removeTextNodeMutationListener = editor.registerMutationListener(
      TextNode,
      (mutatedNodes) => {
        mutatedNodes.forEach((nodeMutation, nodeKey) => {
          if (nodeMutation === 'updated' || nodeMutation === 'created') {
            editor.update(() => {
              const targetTextNode = $getNodeByKey<TextNode>(nodeKey);

              if (!targetTextNode) {
                return;
              }

              const targetTextNodeText = targetTextNode.getTextContent();

              const spaceTrimText = targetTextNodeText
                .replace(/^[\s　]+/, '')
                .replace(/[\s　]+$/, '');

              const spaceSplitTexts = spaceTrimText.trim().split(/\s+/);

              if (spaceSplitTexts.length > 1) {
                for (const text of spaceSplitTexts) {
                  const blockNode = $createMyBlockDecoratorNode(
                    text,
                    `text is ${text}`,
                  );
                  targetTextNode.insertBefore(blockNode);
                }
                targetTextNode.setTextContent('');
                targetTextNode.selectEnd();
                return;
              }

              const isEndWithSpace =
                (targetTextNodeText.endsWith(' ') ||
                  targetTextNodeText.endsWith('　')) &&
                spaceSplitTexts[0] !== '';

              if (isEndWithSpace) {
                const blockNodeText = spaceSplitTexts[0];
                const blockNode = $createMyBlockDecoratorNode(
                  blockNodeText,
                  `text is ${blockNodeText}`,
                );
                targetTextNode.insertBefore(blockNode);
                targetTextNode.setTextContent('');
                targetTextNode.selectEnd();
              }

              return;
            });
          }
        });

        const removeModifyCommand = editor.registerCommand(
          MODIFY_SPACE_SPLIT,
          () => {
            editor.update(() => {
              const textNodeList = $nodesOfType<TextNode>(TextNode);

              textNodeList.forEach((textNode) => {
                const textContent = textNode.getTextContent();
                const spaceTrimText = textContent
                  .replace(/^[\s　]+/, '')
                  .replace(/[\s　]+$/, '');

                if (spaceTrimText === '') {
                  textNode.remove();
                } else {
                  const blockNode = $createMyBlockDecoratorNode(
                    spaceTrimText,
                    `text is ${spaceTrimText}`,
                  );
                  textNode.insertBefore(blockNode);
                  textNode.setTextContent('');
                  $setSelection(null);
                }
              });
            });
            return true;
          },
          COMMAND_PRIORITY_LOW,
        );

        return () => {
          removeTextNodeMutationListener();
          removeModifyCommand();
        };
      },
    );
  }, [editor]);
  return null;
};

export default SpaceSplitBlockPlugin;
export { MODIFY_SPACE_SPLIT };
