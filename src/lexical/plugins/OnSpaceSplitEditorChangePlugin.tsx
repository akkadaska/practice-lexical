import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useRef } from 'react';
import {
  $isZeroWidthNode,
  ZERO_WIDTH_CHARACTER,
} from './ZeroWidthWithIMEPlugin';
import { $isMyBlockDecoratorNode } from '../node';
import { $getRoot, $isParagraphNode, $isTextNode } from 'lexical';

const OnSpaceSplitEditorChangePlugin: React.FC<{
  onChange: (arg: unknown) => unknown;
}> = ({ onChange }) => {
  const [editor] = useLexicalComposerContext();

  const lastContentRef = useRef<string | null>(null);

  useEffect(() => {
    const unregisterOnChange = editor.registerUpdateListener(
      ({ editorState }) => {
        editorState.read(() => {
          const root = $getRoot();
          const firstParagraph = root.getChildAtIndex(0);
          if (root.isEmpty()) {
            if (lastContentRef.current !== '') {
              lastContentRef.current = '';
              onChange('');
            }
            return;
          }
          if (!$isParagraphNode(firstParagraph)) {
            return;
          }
          console.log(
            firstParagraph
              .getChildren()
              .map((node) => [
                node.getType(),
                node.getTextContent(),
                node.getTextContent().includes(ZERO_WIDTH_CHARACTER),
              ]),
          );
          const text = firstParagraph
            .getChildren()
            .filter(
              (node) => $isTextNode(node) || $isMyBlockDecoratorNode(node),
            )
            .filter((node) => !$isZeroWidthNode(node))
            .map((node) => node.getTextContent())
            .join(' ');

          if (lastContentRef.current === text) {
            return;
          }

          lastContentRef.current = text;
          onChange(text);
        });
      },
    );

    return () => {
      unregisterOnChange();
    };
  }, [editor, onChange]);
  return null;
};

export default OnSpaceSplitEditorChangePlugin;
