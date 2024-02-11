import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useRef } from 'react';
import { ZERO_WIDTH_CHARACTER } from './ZeroWidthWithIMEPlugin';
import { $isMyBlockDecoratorNode, $isMyBlockNode } from '../node';
import { $getRoot, $isParagraphNode } from 'lexical';

const OnChangePlugin: React.FC<{
  onChange: (arg: unknown) => unknown;
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
          const firstChildOfFirstParagraph = firstParagraph.getChildAtIndex(0);

          if ($isMyBlockNode(firstChildOfFirstParagraph)) {
            if (
              !(
                lastContentRef.current?.type === 'block' &&
                lastContentRef.current.blockInfo ===
                  firstChildOfFirstParagraph.getBlockInfo()
              )
            ) {
              lastContentRef.current = {
                type: 'block',
                blockInfo: firstChildOfFirstParagraph.getBlockInfo(),
              };
              onChange(lastContentRef.current);
            }
            return;
          }

          if ($isMyBlockDecoratorNode(firstChildOfFirstParagraph)) {
            if (
              !(
                lastContentRef.current?.type === 'decorator-block' &&
                lastContentRef.current.blockInfo ===
                  firstChildOfFirstParagraph.getBlockInfo()
              )
            ) {
              lastContentRef.current = {
                type: 'decorator-block',
                blockInfo: firstChildOfFirstParagraph.getBlockInfo(),
              };
              onChange(lastContentRef.current);
            }
            return;
          }

          const text =
            firstChildOfFirstParagraph
              ?.getTextContent()
              .replace(new RegExp(ZERO_WIDTH_CHARACTER, 'g'), '') ?? '';
          if (
            !(
              lastContentRef.current?.type === 'text' &&
              lastContentRef.current.text === text
            )
          ) {
            lastContentRef.current = {
              type: 'text',
              text: text,
            };
            onChange(lastContentRef.current);
          }
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
