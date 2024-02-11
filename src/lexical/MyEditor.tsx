'use client';

import {
  InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { EditorRefPlugin } from '@lexical/react/LexicalEditorRefPlugin';
import { MyBlockDecoratorNode, MyBlockNode } from './node';
import ProhibitLineBreakPlugin from './plugins/ProhibitLineBreakPlugin';
import React from 'react';
import ClearEditorPlugin, {
  CLEAR_EDITOR_COMMAND,
} from './plugins/ClearEditorPlugin';
import { LexicalEditor } from 'lexical';
import SetSingleBlockNodePlugin, {
  SET_SINGLE_BLOCK_COMMAND,
} from './plugins/SetSingleBlockNodePlugin';
import EnsureExclusiveMyBlockNodePlugin from './plugins/EnsureExclusiveMyBlockNode';
import OnChangePlugin from './plugins/OnChangePlugin';
import SetSingleBlockDecoratorNodePlugin, {
  SET_SINGLE_DECORATOR_BLOCK_COMMAND,
} from './plugins/SetSingleBlockDecoratorNodePlugin';
import EnsureExclusiveMyDecoratorBlockNodePlugin from './plugins/EnsureExclusiveMyDecoratorBlockNode';
import {
  ZERO_WIDTH_CHARACTER,
  ZeroWidthNode,
  ZeroWidthWithIMEPlugin,
} from './plugins/ZeroWidthWithIMEPlugin';

const onError = (error: unknown) => {
  console.error(error);
};

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

const MyEditor: React.FC<{
  editorRef: React.RefObject<LexicalEditor>;
  onChange: (arg: unknown) => unknown;
}> = ({ editorRef, onChange }) => {
  const initialConfig: InitialConfigType = {
    editable: true,
    namespace: 'MyEditor',
    onError,
    nodes: [MyBlockNode, MyBlockDecoratorNode, ZeroWidthNode],
  };

  return (
    <div className="relative">
      <LexicalComposer initialConfig={initialConfig}>
        <PlainTextPlugin
          contentEditable={<MyContentEditable />}
          placeholder={<MyPlaceHolder>Enter some text...</MyPlaceHolder>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <EditorRefPlugin editorRef={editorRef} />
        <ProhibitLineBreakPlugin />
        <ClearEditorPlugin />
        <SetSingleBlockNodePlugin />
        <SetSingleBlockDecoratorNodePlugin />
        <ZeroWidthWithIMEPlugin textContent={ZERO_WIDTH_CHARACTER} />
        <EnsureExclusiveMyBlockNodePlugin />
        <EnsureExclusiveMyDecoratorBlockNodePlugin />
        <OnChangePlugin onChange={onChange} />
      </LexicalComposer>
    </div>
  );
};

const useLexicalEditorControl = () => {
  const editorRef = React.useRef<LexicalEditor>(null);

  const controller = {
    clear: (focusAfterClear?: boolean) => {
      editorRef.current?.dispatchCommand<typeof CLEAR_EDITOR_COMMAND>(
        CLEAR_EDITOR_COMMAND,
        { focusAfterClear },
      );
    },
    setSingleBlockNode: (text: string, blockInfo: string) => {
      editorRef.current?.dispatchCommand<typeof SET_SINGLE_BLOCK_COMMAND>(
        SET_SINGLE_BLOCK_COMMAND,
        { text, blockInfo },
      );
    },
    SetSingleBlockDecoratorNode: (text: string, blockInfo: string) => {
      editorRef.current?.dispatchCommand<
        typeof SET_SINGLE_DECORATOR_BLOCK_COMMAND
      >(SET_SINGLE_DECORATOR_BLOCK_COMMAND, { text, blockInfo });
    },
  } as const;
  return [editorRef, controller] as const;
};

export default MyEditor;
export { useLexicalEditorControl };
