'use client';
import MyEditor, { useLexicalEditorControl } from '@/lexical/MyEditor';
import MySpaceSplitEditor, {
  useLexicalSpaceSplitEditorControl,
} from '@/lexical/MySpaceSplitEditor';
import { useRef, useState } from 'react';

const Page: React.FC = () => {
  const [editorRef, controller] = useLexicalEditorControl();
  const [spaceSplitEditorRef, spaceSplitController] =
    useLexicalSpaceSplitEditorControl();

  const [state, setState] = useState<unknown>(null);
  const [spaceSplitState, setSpaceSplitState] = useState<unknown>(null);

  const [isShowErrorMessage, setIsShowErrorMessage] = useState(false);

  const errorMessageTimer = useRef<number | null>(null);

  const showErrorMessage = () => {
    setIsShowErrorMessage(true);
    if (errorMessageTimer.current) {
      clearTimeout(errorMessageTimer.current);
    }
    errorMessageTimer.current = window.setTimeout(() => {
      setIsShowErrorMessage(false);
    }, 3000);
  };
  return (
    <div>
      <p
        className={`transition-opacity duration-500 ease-in-out ${isShowErrorMessage ? 'opacity-100' : 'opacity-0'} text-red-600 font-bold text-sm`}
      >
        ここのクエリは一つだけしか入力できません。
      </p>
      <MyEditor
        editorRef={editorRef}
        onChange={setState}
        onInvalidInput={showErrorMessage}
      />
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
            controller.SetSingleBlockDecoratorNode(
              '有効なクエリ',
              'custom decorator info',
            );
          }}
        >
          Set Valid Decorator Block Node
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => {
            controller.SetSingleBlockDecoratorNode(
              '無効なクエリ',
              'custom decorator info',
              true,
            );
          }}
        >
          Set Invalid Decorator Block Node
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
