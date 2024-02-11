'use client';

import {
  InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { NextPage } from 'next';
import React, {
  MouseEventHandler,
  ReactNode,
  RefObject,
  createRef,
  useEffect,
} from 'react';
import {
  ZeroWidthNode as OriginalZeroWidthNode,
  ZeroWidthPlugin as OriginalZeroWidthPlugin,
  ZERO_WIDTH_CHARACTER as ORIGINAL_ZERO_WIDTH_CHARACTER,
} from 'lexical-beautiful-mentions';
import ProhibitLineBreakPlugin from '@/lexical/plugins/ProhibitLineBreakPlugin';
import { EditorRefPlugin } from '@lexical/react/LexicalEditorRefPlugin';
import {
  $createParagraphNode,
  $getRoot,
  $isParagraphNode,
  $setSelection,
  LexicalEditor,
} from 'lexical';
import {
  $createMyBlockDecoratorNode,
  MyBlockDecoratorNode,
} from '@/lexical/node';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FEFFNode, FEFF_CHARACTER } from '@/lexical/plugins/FEFFNode';
import { FEFFPlugin } from '@/lexical/plugins/FEFFPlugin';
import {
  ZERO_WIDTH_CHARACTER,
  ZeroWidthNode,
} from '@/lexical/plugins/ZeroWidthNode';
import { ZeroWidthWithIMEPlugin } from '@/lexical/plugins/ZeroWidthWithIMEPlugin';

const OriginalZeroWidthCharacterRegex = new RegExp(
  ORIGINAL_ZERO_WIDTH_CHARACTER,
  'g',
);
const FEFF_CHARACTER_REGEX = new RegExp(FEFF_CHARACTER, 'g');

const MyContentEditable: React.FC = () => (
  <ContentEditable className="z-10 relative p-2 border border-gray-400 outline-none focus:border-b-2 focus:border-blue-600 rounded" />
);

const MyPlaceHolder: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <div className="z-0 p-2 absolute top-0 left-0 w-full text-gray-400">
    {children}
  </div>
);

type EditorStateHistory = { type: string; content: string }[];

const isSameSnapshot = (
  a: EditorStateHistory | null,
  b: EditorStateHistory | null,
): boolean => {
  if (!a && !b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  if (a.length !== b.length) {
    return false;
  }
  return a.every((aItem, index) => {
    const bItem = b[index];
    return aItem.type === bItem.type && aItem.content === bItem.content;
  });
};

const useEditorStateHistoryState = () => {
  const HISTORY_COUNT = 5;

  const [state, setState] = React.useState<
    { state: EditorStateHistory | null; duplicatedCount: number }[]
  >([
    ...new Array(HISTORY_COUNT)
      .fill(null)
      .map(() => ({ state: null, duplicatedCount: 0 })),
  ]);

  const addHistory = React.useCallback(
    (newHistory: EditorStateHistory) => {
      const lastHistory = state.at(0);
      if (!lastHistory) {
        setState([{ state: newHistory, duplicatedCount: 1 }]);
        return;
      }

      if (isSameSnapshot(lastHistory.state, newHistory)) {
        setState([
          {
            state: newHistory,
            duplicatedCount: lastHistory.duplicatedCount + 1,
          },
          ...state.slice(1),
        ]);
        return;
      }

      setState([
        {
          state: newHistory,
          duplicatedCount: 1,
        },
        ...state.slice(0, HISTORY_COUNT - 1),
      ]);
    },
    [state],
  );

  const clearHistory = React.useCallback(() => {
    setState([
      ...new Array(HISTORY_COUNT)
        .fill(null)
        .map(() => ({ state: null, duplicatedCount: 0 })),
    ]);
  }, []);

  return [state, addHistory, clearHistory] as const;
};

const OnChangePlugin: React.FC<{
  onChange: (newState: EditorStateHistory) => unknown;
}> = ({ onChange }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const unregisterOnChange = editor.registerUpdateListener(
      ({ editorState }) => {
        editorState.read(() => {
          const root = $getRoot();
          const firstParagraph = root.getChildAtIndex(0);

          if (
            root.isEmpty() ||
            !firstParagraph ||
            !$isParagraphNode(firstParagraph)
          ) {
            onChange([
              {
                type: 'empty',
                content: '',
              },
            ]);
          } else {
            onChange(
              firstParagraph.getChildren().map((node) => ({
                type: node.getType(),
                content: node.getTextContent(),
              })),
            );
          }
        });
      },
    );

    return () => {
      unregisterOnChange();
    };
  }, [editor, onChange]);
  return null;
};

const EditorStateHistoryElement: React.FC<{
  type: string;
  content: string;
}> = ({ type, content }) => {
  const replacedContent = content
    .replace(OriginalZeroWidthCharacterRegex, '◆')
    .replace(FEFF_CHARACTER_REGEX, '■');
  return (
    <span className="mx-2">
      [<code className="text-blue-800 font-bold">{type}</code>:{' '}
      <code>{replacedContent}</code>]
    </span>
  );
};

const EditorStateHistoryLine: React.FC<{
  history: EditorStateHistory | null;
  duplicatedCount: number;
}> = ({ history, duplicatedCount }) => {
  if (!history || history.length === 0) {
    return (
      <p className="text-gray-800 text-xs">
        {duplicatedCount > 1 && (
          <span className="text-gray-600">x{duplicatedCount}</span>
        )}
      </p>
    );
  }
  return (
    <p className="text-gray-800 text-xs">
      {history.map((item, index) => (
        <EditorStateHistoryElement
          key={index}
          type={item.type}
          content={item.content}
        />
      ))}
      {duplicatedCount > 1 && (
        <span className="text-gray-600">x{duplicatedCount}</span>
      )}
    </p>
  );
};

const Editor: React.FC<{
  children?: ReactNode;
  initialConfig: InitialConfigType;
  title: string;
  editorRef: RefObject<LexicalEditor>;
  editorState: {
    state: EditorStateHistory | null;
    duplicatedCount: number;
  }[];
  onChange: (newState: EditorStateHistory) => unknown;
}> = ({ children, initialConfig, title, editorRef, editorState, onChange }) => {
  return (
    <section className="m-2 mb-8">
      <h2 className="text-xl font-bold my-1">{title}</h2>
      <div className="relative">
        <LexicalComposer initialConfig={initialConfig}>
          <PlainTextPlugin
            contentEditable={<MyContentEditable />}
            placeholder={<MyPlaceHolder>Enter some text...</MyPlaceHolder>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <ProhibitLineBreakPlugin />
          <EditorRefPlugin editorRef={editorRef} />
          <OnChangePlugin onChange={onChange} />
          {children}
        </LexicalComposer>
      </div>
      <div>
        {editorState.map(({ state, duplicatedCount }, index) => (
          <EditorStateHistoryLine
            history={state}
            duplicatedCount={duplicatedCount}
            key={index}
          />
        ))}
      </div>
    </section>
  );
};

const Page: NextPage = () => {
  const defaultInitialConfig: InitialConfigType = {
    editable: true,
    namespace: 'DefaultLexicalPlainTextEditor',
    onError: console.error,
    nodes: [MyBlockDecoratorNode],
  } as const;

  const originalZeroWidthPluginInitialConfig: InitialConfigType = {
    editable: true,
    namespace: 'OriginalZeroWidthPlugin',
    onError: console.error,
    nodes: [MyBlockDecoratorNode, OriginalZeroWidthNode],
  } as const;

  const feffPluginInitialConfig: InitialConfigType = {
    editable: true,
    namespace: 'FEFFPlugin',
    onError: console.error,
    nodes: [MyBlockDecoratorNode, FEFFNode],
  } as const;

  const zeroWidthWithIMEPluginConfig: InitialConfigType = {
    editable: true,
    namespace: 'ZeroWidthWithIMEPlugin',
    onError: console.error,
    nodes: [MyBlockDecoratorNode, ZeroWidthNode],
  } as const;

  const [
    defaultEditorState,
    defaultEditorAddHistory,
    clearDefaultEditorHistory,
  ] = useEditorStateHistoryState();
  const [
    originalZeroWidthPluginEditorState,
    originalZeroWidthPluginEditorAddHistory,
    clearOriginalZeroWidthPluginEditorHistory,
  ] = useEditorStateHistoryState();
  const [
    feffPluginEditorState,
    feffPluginEditorAddHistory,
    clearFEFFPluginEditorHistory,
  ] = useEditorStateHistoryState();
  const [
    zeroWidthWithIMEPluginEditorState,
    zeroWidthWithIMEPluginEditorAddHistory,
    clearZeroWidthWithIMEPluginEditorHistory,
  ] = useEditorStateHistoryState();

  const defaultEditorRef = createRef<LexicalEditor>();
  const originalZeroWidthPluginEditorRef = createRef<LexicalEditor>();
  const feffPluginEditorRef = createRef<LexicalEditor>();
  const zeroWidthWithIMEPluginEditorRef = createRef<LexicalEditor>();
  const allEditorRefs = [
    defaultEditorRef,
    originalZeroWidthPluginEditorRef,
    feffPluginEditorRef,
    zeroWidthWithIMEPluginEditorRef,
  ] as const;

  const clear: MouseEventHandler = () => {
    allEditorRefs.forEach((ref) => {
      ref.current?.update(() => {
        $getRoot().clear();
        $setSelection(null);
      });
    });
  };

  const clearAndSetDecoratorNode: MouseEventHandler = () => {
    allEditorRefs.forEach((ref) => {
      ref.current?.update(() => {
        $getRoot().clear();
        $setSelection(null);

        const paragraphNode = $createParagraphNode();

        const blockNode1 = $createMyBlockDecoratorNode(
          'デコレータ1',
          'decorator1',
        );

        const blockNode2 = $createMyBlockDecoratorNode(
          'デコレータ2',
          'decorator2',
        );

        paragraphNode.append(blockNode1, blockNode2);
        $getRoot().append(paragraphNode);
      });
    });
  };

  const clearHistory: MouseEventHandler = () => {
    clearDefaultEditorHistory();
    clearOriginalZeroWidthPluginEditorHistory();
    clearFEFFPluginEditorHistory();
    clearZeroWidthWithIMEPluginEditorHistory();
  };

  return (
    <main>
      <Editor
        initialConfig={defaultInitialConfig}
        title="Default Lexical PlainText Editor"
        editorRef={defaultEditorRef}
        editorState={defaultEditorState}
        onChange={defaultEditorAddHistory}
      ></Editor>
      <Editor
        initialConfig={originalZeroWidthPluginInitialConfig}
        title="Original ZeroWidthPlugin Editor"
        editorRef={originalZeroWidthPluginEditorRef}
        editorState={originalZeroWidthPluginEditorState}
        onChange={originalZeroWidthPluginEditorAddHistory}
      >
        <OriginalZeroWidthPlugin textContent={ORIGINAL_ZERO_WIDTH_CHARACTER} />
      </Editor>
      <Editor
        initialConfig={feffPluginInitialConfig}
        title="FEFF Plugin Editor"
        editorRef={feffPluginEditorRef}
        editorState={feffPluginEditorState}
        onChange={feffPluginEditorAddHistory}
      >
        <FEFFPlugin textContent={FEFF_CHARACTER} />
        <ProhibitLineBreakPlugin />
      </Editor>
      <Editor
        initialConfig={zeroWidthWithIMEPluginConfig}
        title="ZeroWidthWithIME Plugin Editor"
        editorRef={zeroWidthWithIMEPluginEditorRef}
        editorState={zeroWidthWithIMEPluginEditorState}
        onChange={zeroWidthWithIMEPluginEditorAddHistory}
      >
        <ZeroWidthWithIMEPlugin textContent={ZERO_WIDTH_CHARACTER} />
        <ProhibitLineBreakPlugin />
      </Editor>
      <section className="m-2">
        <button
          className="mr-2 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={clear}
        >
          Clear(Focused)
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={clearAndSetDecoratorNode}
        >
          Set Decorator Block Node
        </button>
        <button
          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={clearHistory}
        >
          Clear History
        </button>
      </section>
      <section className="m-2">
        <h2 className="text-xl font-bold my-1">Memo</h2>
        <div>
          <ul>
            <li className="mb-2">
              Original
              ZeroWidthPluginはChromeでIME確定前の状態でバックスペースを雄と最後の文字が重複する問題がある。また、SafariではTextNodeにZeroWidthCharacterが含まれてしまう。Androidで高確率で一文字目のあとにカーソルが前に移動する問題がある。
            </li>
            <li className="mb-2">
              FEFFPluginもSafariではTextNodeにFFEFCharacterが含まれてしまう。しかし、ChromeでのIME確定前の状態でバックスペースを押すと最後の文字が重複する問題はない。Androidで高確率で一文字目のあとにカーソルが前に移動する問題がある。
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
};

export default Page;
