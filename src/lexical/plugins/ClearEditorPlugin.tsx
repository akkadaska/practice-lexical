import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getRoot,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  createCommand,
} from 'lexical';
import { useEffect } from 'react';

/**
 * エディタをクリアするコマンド
 * クリア後にフォーカスを戻すかどうかを指定できるオプションつき
 */
const CLEAR_EDITOR_COMMAND = createCommand<{ focusAfterClear?: boolean }>(
  'CLEAR_EDITOR_COMMAND',
);

/**
 * `CLEAR_EDITOR_COMMAND` を実行できるようにするプラグイン
 */
const ClearEditorPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    const unregisterCommand = editor.registerCommand(
      CLEAR_EDITOR_COMMAND,
      ({ focusAfterClear }) => {
        editor.update(() => {
          $getRoot().clear();
          if (!focusAfterClear) {
            $setSelection(null);
          }
        });

        return true;
      },
      COMMAND_PRIORITY_LOW,
    );

    return unregisterCommand;
  }, [editor]);
  return null;
};

export default ClearEditorPlugin;
export { CLEAR_EDITOR_COMMAND };
