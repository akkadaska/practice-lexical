import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useRef } from 'react';
import { ZERO_WIDTH_CHARACTER } from './ZeroWidthWithIMEPlugin';
import { $isMyBlockDecoratorNode, MyBlockDecoratorNode } from '../node';
import { $getRoot, $isParagraphNode, $isTextNode, TextNode } from 'lexical';

const OnChangePlugin: React.FC<{
  onChange: (
    arg:
      | { type: 'text'; text: string }
      | { type: 'block'; blockInfo: string }
      | { type: 'decorator-block'; blockInfo: string }
      | null,
  ) => unknown;
}> = ({ onChange }) => {
  const [editor] = useLexicalComposerContext();

  const lastContentRef = useRef<
    | { type: 'text'; text: string }
    | { type: 'block'; blockInfo: string }
    | { type: 'decorator-block'; blockInfo: string }
    | null
  >(null);

  useEffect(() => {
    const unregisterOnChange = editor.registerUpdateListener(
      ({ editorState }) => {
        editorState.read(() => {
          const root = $getRoot();
          const firstParagraph = root.getChildAtIndex(0);
          if (!$isParagraphNode(firstParagraph)) {
            if (
              !(
                lastContentRef.current?.type === 'text' &&
                lastContentRef.current.text === ''
              )
            ) {
              lastContentRef.current = { type: 'text', text: '' };
              onChange(lastContentRef.current);
            }
            return;
          }
          const decoratorBlock = firstParagraph.getChildren().find((child) => {
            return $isMyBlockDecoratorNode(child);
          }) as MyBlockDecoratorNode | undefined;

          if (decoratorBlock) {
            if (
              !(
                lastContentRef.current?.type === 'decorator-block' &&
                lastContentRef.current.blockInfo ===
                  decoratorBlock.getBlockInfo()
              )
            ) {
              lastContentRef.current = {
                type: 'decorator-block',
                blockInfo: decoratorBlock.getBlockInfo(),
              };
              onChange(lastContentRef.current);
            }
            return;
          }

          const textNode = firstParagraph.getChildren().find((child) => {
            return $isTextNode(child);
          }) as TextNode | undefined;

          if (textNode) {
            const textContent = textNode
              .getTextContent()
              .replace(ZERO_WIDTH_CHARACTER, '');
            if (
              !(
                lastContentRef.current?.type === 'text' &&
                lastContentRef.current.text === textContent
              )
            ) {
              lastContentRef.current = {
                type: 'text',
                text: textContent,
              };
              onChange(lastContentRef.current);
            }
            return;
          }

          if (
            !(
              lastContentRef.current?.type === 'text' &&
              lastContentRef.current.text === ''
            )
          ) {
            lastContentRef.current = {
              type: 'text',
              text: '',
            };
            onChange(lastContentRef.current);
          }
          return;
        });
      },
    );

    return () => {
      unregisterOnChange();
    };
  }, [editor, onChange]);
  return null;
};

export default OnChangePlugin;
