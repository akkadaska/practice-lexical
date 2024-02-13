import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useRef } from 'react';
import { $isZeroWidthNode } from './ZeroWidthWithIMEPlugin';
import { $isMyBlockDecoratorNode } from '../node';
import {
  $getRoot,
  $isParagraphNode,
  $isTextNode,
  $nodesOfType,
  TextNode,
} from 'lexical';

const OnSpaceSplitEditorChangePlugin: React.FC<{
  onChange: (arg: { text: string; isModified: boolean } | null) => unknown;
}> = ({ onChange }) => {
  const [editor] = useLexicalComposerContext();

  const lastContentRef = useRef<{ text: string; isModified: boolean } | null>(
    null,
  );

  useEffect(() => {
    const unregisterOnChange = editor.registerUpdateListener(
      ({ editorState }) => {
        editorState.read(() => {
          const root = $getRoot();
          const firstParagraph = root.getChildAtIndex(0);
          if (root.isEmpty()) {
            if (lastContentRef.current?.text !== '') {
              lastContentRef.current = {
                text: '',
                isModified: true,
              };
              onChange(lastContentRef.current);
            }
            return;
          }
          if (!$isParagraphNode(firstParagraph)) {
            return;
          }
          const text = firstParagraph
            .getChildren()
            .filter(
              (node) => $isTextNode(node) || $isMyBlockDecoratorNode(node),
            )
            .filter((node) => !$isZeroWidthNode(node))
            .map((node) => node.getTextContent())
            .join(' ');

          const isModified = $nodesOfType(TextNode).length === 0;

          if (
            lastContentRef.current?.text === text &&
            lastContentRef.current.isModified === isModified
          ) {
            return;
          }

          lastContentRef.current = {
            text,
            isModified,
          };
          onChange(lastContentRef.current);
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
