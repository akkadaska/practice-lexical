'use client';
import MyEditor, { useLexicalEditorControl } from '@/lexical/MyEditor';

const Page: React.FC = () => {
  const [editorRef, controller] = useLexicalEditorControl();
  return (
    <div>
      <MyEditor editorRef={editorRef} />
      <div className="mt-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => {
            controller.clear(false);
          }}
        >
          Clear(Unfocused)
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => {
            controller.clear(true);
          }}
        >
          Clear(Focused)
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => {
            controller.setSingleBlockNode('Hello, Block!', 'custom info');
          }}
        >
          Set Block Node
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => {
            controller.SetSingleBlockDecoratorNode(
              'Hello, Decorator!',
              'custom decorator info',
            );
          }}
        >
          Set Decorator Block Node
        </button>
      </div>
    </div>
  );
};

export default Page;
