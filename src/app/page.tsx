'use client';
import MyEditor, {
  isValidQuery,
  useLexicalEditorControl,
} from '@/lexical/MyEditor';
import MySpaceSplitEditor, {
  useLexicalSpaceSplitEditorControl,
} from '@/lexical/MySpaceSplitEditor';
import { useRef, useState } from 'react';

const Page: React.FC = () => {
  const [editorRef, controller] = useLexicalEditorControl();
  const [spaceSplitEditorRef, spaceSplitController] =
    useLexicalSpaceSplitEditorControl();

  const [state, setState] = useState<
    | { type: 'text'; text: string }
    | { type: 'block'; blockInfo: string }
    | { type: 'decorator-block'; blockInfo: string }
    | null
  >(null);
  const [spaceSplitState, setSpaceSplitState] = useState<{
    text: string;
    isModified: boolean;
  } | null>(null);

  const [isShowErrorMessage, setIsShowErrorMessage] = useState<string | null>(
    null,
  );

  const errorMessageTimer = useRef<number | null>(null);

  const showErrorMessage = (type: string) => {
    setIsShowErrorMessage(
      type === 'multi-query'
        ? 'ここのクエリは一つだけしか入力できません。'
        : 'このクエリは無効です。',
    );
    if (errorMessageTimer.current) {
      clearTimeout(errorMessageTimer.current);
    }
    errorMessageTimer.current = window.setTimeout(() => {
      setIsShowErrorMessage(null);
    }, 2500); // 多分ブラウザとIMEのイベントループの関係で2000msにしないといけなさそう（IME確定前は一定間隔でイベントが発生してそう）
  };

  const onTokyoStationInputComplete = (noFocus?: boolean) => {
    if (state === null || state?.type === 'text') {
      const queryText = state?.text ?? '';
      if (queryText === '') {
        alert('クエリ空で検索実行');
      } else if (isValidQuery(queryText)) {
        controller.setSingleBlockDecoratorNode(
          '東京駅',
          'valid query',
          false,
          !noFocus,
        );
      } else {
        controller.setSingleBlockDecoratorNode(
          queryText,
          'invalid query',
          true,
          !noFocus,
        );
        showErrorMessage('invalid-query');
      }
    } else if (state.type === 'decorator-block') {
      const isValid = state.blockInfo === 'valid query';
      if (isValid) {
        alert('東京駅で検索実行');
      } else {
        showErrorMessage('invalid-query');
      }
    }
  };

  const onTokyoStationInputBlur = () => {
    if (state === null || state?.type === 'text') {
      if (state?.text && state.text !== '') {
        onTokyoStationInputComplete(true);
      }
    }
  };

  const onSpaceSplitEditorComplete = () => {
    if (!spaceSplitState?.isModified) {
      spaceSplitController.modify(true);
      return;
    }
    if (!spaceSplitState || spaceSplitState?.text === '') {
      alert('空で検索実行');
      return;
    }
    alert(`${spaceSplitState.text}で検索実行`);
  };

  const onSpaceSplitEditorBlur = () => {
    spaceSplitController.modify();
  };
  return (
    <div>
      <p
        className={`transition-opacity duration-500 ease-in-out ${isShowErrorMessage ? 'opacity-100' : 'opacity-0'} text-red-600 font-bold text-sm`}
      >
        {isShowErrorMessage ?? ''}
      </p>
      <MyEditor
        editorRef={editorRef}
        onChange={setState}
        onInvalidInput={showErrorMessage}
        onInputComplete={onTokyoStationInputComplete}
        onBlur={onTokyoStationInputBlur}
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
      </div>
      <div className="my-2">
        <code>{JSON.stringify(state)}</code>
      </div>
      <hr className="my-4" />
      <MySpaceSplitEditor
        editorRef={spaceSplitEditorRef}
        onChange={setSpaceSplitState}
        onInputComplete={onSpaceSplitEditorComplete}
        onBlur={onSpaceSplitEditorBlur}
        modifyForSpaceSplitBlockPlugin={spaceSplitController.modify}
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
      </div>
      <div className="my-2">
        <code>{JSON.stringify(spaceSplitState)}</code>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold">Concept</h2>
        <p>どちらもブロックに確定しないとEnterで検索できない</p>
        <p>検索できない場合は検索できないことを示すブロック</p>
        <p>検索できないときはそもそも検索しない(空にするとかしない)</p>
        <p>検索できないのに検索しようとしたときは警告</p>
        <p>
          ブロックを強要するので、ブロックは気持ちいい操作感に(BackSpace、Deleteで消せる、Xボタンでも消せる、クリックで編集できる、Xでも消せる)
        </p>
      </div>
    </div>
  );
};

export default Page;
