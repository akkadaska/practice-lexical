import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getRoot,
  $nodesOfType,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  TextNode,
  createCommand,
} from 'lexical';
import { useEffect } from 'react';
import { $createMyBlockDecoratorNode } from '../node';

const MODIFY_SPACE_SPLIT = createCommand<boolean | undefined>(
  'MODIFY_SPACE_SPLIT',
);

const SpaceSplitBlockPlugin: React.FC<{
  modify: (focus?: boolean) => unknown;
}> = ({ modify }) => {
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
            $createMyBlockDecoratorNode(text, `text is ${text}`, false, () =>
              modify(false),
            ),
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
      (focus) => {
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
                false,
                () => modify(false),
              );
              textNode.insertBefore(blockNode);
              textNode.setTextContent('');
              $setSelection(null);
            }
          });
          if (focus) {
            $getRoot().selectEnd();
          }
        });
        return true;
      },
      COMMAND_PRIORITY_LOW,
    );

    return () => {
      unregisterNodeTransform();
      removeModifyCommand();
    };
  }, [editor, modify]);
  return null;
};

export default SpaceSplitBlockPlugin;
export { MODIFY_SPACE_SPLIT };
