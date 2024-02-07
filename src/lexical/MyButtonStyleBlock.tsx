import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $nodesOfType } from 'lexical';
import { MyBlockDecoratorNode } from './node';

const ButtonStyleBlock: React.FC<{
  children: React.ReactNode;
  uid: string;
}> = ({ children, uid }) => {
  const [editor] = useLexicalComposerContext();

  const onClick = () => {
    editor.update(() => {
      const myBlockDecoratorNodes = $nodesOfType(MyBlockDecoratorNode);

      myBlockDecoratorNodes.find((node) => node.getUid() === uid)?.remove();
    });
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
