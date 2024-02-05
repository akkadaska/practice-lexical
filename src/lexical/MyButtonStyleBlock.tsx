import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { CLEAR_EDITOR_COMMAND } from './plugins/ClearEditorPlugin';

const ButtonStyleBlock: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [editor] = useLexicalComposerContext();

  const onClick = () => {
    editor.dispatchCommand(CLEAR_EDITOR_COMMAND, { focusAfterClear: true });
  };

  return (
    <div className="inline-block px-1 text-xs">
      <div className="px-1 inline-block text-white bg-red-900 rounded">
        {children}
        <button
          type="button"
          className="inline-block p-1 text-red-200"
          onClick={onClick}
        >
          X
        </button>
      </div>
    </div>
  );
};

export default ButtonStyleBlock;
