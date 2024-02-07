import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useRef } from 'react';
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
          if (!$isParagraphNode(firstParagraph)) {
            return;
          }
          const text = firstParagraph
            .getChildren()
            .filter(
              (node) => $isTextNode(node) || $isMyBlockDecoratorNode(node),
            )
            .map((node) => node.getTextContent())
            .join(' ')
            .trim();

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
