import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createTextNode, $nodesOfType } from 'lexical';
import { MyBlockDecoratorNode } from './node';
import { ZeroWidthNode } from './plugins/ZeroWidthWithIMEPlugin';
import { MouseEventHandler } from 'react';

const ButtonStyleBlock: React.FC<{
  children: React.ReactNode;
  uid: string;
  disabled?: boolean;
  modify?: () => unknown;
}> = ({ children, uid, disabled, modify }) => {
  const [editor] = useLexicalComposerContext();

  const onClose: MouseEventHandler = (e) => {
    e.preventDefault();
    editor.update(() => {
      const myBlockDecoratorNodes = $nodesOfType(MyBlockDecoratorNode);

      myBlockDecoratorNodes.find((node) => node.getUid() === uid)?.remove();

      const myBlockDecoratorNodeList = $nodesOfType(MyBlockDecoratorNode);
      if (myBlockDecoratorNodeList.length === 0) {
        const zeroWidthNodeList = $nodesOfType(ZeroWidthNode);
        zeroWidthNodeList.forEach((node) => {
          node.remove();
        });
      }
    });
  };

  const onClick: MouseEventHandler = (e) => {
    e.preventDefault();
    modify && modify();
    editor.update(() => {
      const myBlockDecoratorNodes = $nodesOfType(MyBlockDecoratorNode);

      const targetBlockNode = myBlockDecoratorNodes.find(
        (node) => node.getUid() === uid,
      );

      if (targetBlockNode) {
        const textNode = $createTextNode(
          targetBlockNode
            .getTextContent()
            .replace('(クエリが見つかりません)', ''),
        );
        targetBlockNode.replace(textNode);
        textNode.selectEnd();
      }

      const myBlockDecoratorNodeList = $nodesOfType(MyBlockDecoratorNode);
      if (myBlockDecoratorNodeList.length === 0) {
        const zeroWidthNodeList = $nodesOfType(ZeroWidthNode);
        zeroWidthNodeList.forEach((node) => {
          node.remove();
        });
      }
    });
  };

  if (disabled) {
    return (
      <div className="inline-block px-1 text-xs">
        <div
          className="px-1 inline-block text-red-800 bg-red-100 rounded border border-red-800 border-dashed"
          onClick={onClick}
        >
          {children}(クエリが見つかりません)
          <button
            type="button"
            className="inline-block p-1 text-red-800"
            onClick={onClose}
          >
            X
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="inline-block px-1 text-xs">
      <div
        className="px-1 inline-block text-white bg-red-700 rounded border border-red-900"
        onClick={onClick}
      >
        {children}
        <button
          type="button"
          className="inline-block p-1 text-red-200"
          onClick={onClose}
        >
          X
        </button>
      </div>
    </div>
  );
};

export default ButtonStyleBlock;
