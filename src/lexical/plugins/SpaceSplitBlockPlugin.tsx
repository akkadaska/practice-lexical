import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
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
    const unregisterNodeTransform = editor.registerNodeTransform(
      TextNode,
      (textNode) => {
        const textContent = textNode.getTextContent();

        const isContainSpace =
          textContent.includes(' ') || textContent.includes('　');

        if (!isContainSpace) {
          return;
        }

        const isEndWithSpace =
          textContent.endsWith(' ') || textContent.endsWith('　');

        const spaceSplitTextList = textContent
          .split(' ')
          .map((text) => {
            return text.split('　');
          })
          .flat()
          .filter((text) => text !== '');

        const isSingleWordEndWithSpace =
          spaceSplitTextList.length === 1 && isEndWithSpace;

        const isMultipleWords = spaceSplitTextList.length > 1;

        if (!(isSingleWordEndWithSpace || isMultipleWords)) {
          return;
        }

        editor.update(() => {
          const blockNodeList = spaceSplitTextList.map((text) =>
            $createMyBlockDecoratorNode(text, `text is ${text}`),
          );
          blockNodeList.forEach((blockNode) => {
            textNode.insertBefore(blockNode);
          });

          textNode.remove();
        });
      },
    );

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
      unregisterNodeTransform();
      removeModifyCommand();
    };
  }, [editor]);
  return null;
};

export default SpaceSplitBlockPlugin;
export { MODIFY_SPACE_SPLIT };
