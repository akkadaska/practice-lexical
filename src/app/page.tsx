'use client';
import MyEditor, { useLexicalEditorControl } from '@/lexical/MyEditor';
import MySpaceSplitEditor, {
  useLexicalSpaceSplitEditorControl,
} from '@/lexical/MySpaceSplitEditor';
import { useState } from 'react';

const Page: React.FC = () => {
  const [editorRef, controller] = useLexicalEditorControl();
  const [spaceSplitEditorRef, spaceSplitController] =
    useLexicalSpaceSplitEditorControl();

  const [state, setState] = useState<unknown>(null);
  const [spaceSplitState, setSpaceSplitState] = useState<unknown>(null);
  return (
    <div>
      <MyEditor editorRef={editorRef} onChange={setState} />
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
      <div className="my-2">
        <code>{JSON.stringify(state)}</code>
      </div>
      <hr className="my-4" />
      <MySpaceSplitEditor
        editorRef={spaceSplitEditorRef}
        onChange={setSpaceSplitState}
      />
      <div className="mt-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => {
            spaceSplitController.clear(false);
          }}
        >
          Clear(Unfocused)
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => {
            spaceSplitController.clear(true);
          }}
        >
          Clear(Focused)
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => {
            spaceSplitController.modify();
          }}
        >
          Modify
        </button>
      </div>
      <div className="my-2">
        <code>{JSON.stringify(spaceSplitState)}</code>
      </div>
    </div>
  );
};

export default Page;
