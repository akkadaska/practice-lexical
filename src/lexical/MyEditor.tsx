'use client';

import {
  InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { EditorRefPlugin } from '@lexical/react/LexicalEditorRefPlugin';
import { MyBlockDecoratorNode } from './node';
import ProhibitLineBreakPlugin from './plugins/ProhibitLineBreakPlugin';
import React, { FocusEventHandler } from 'react';
import ClearEditorPlugin, {
  CLEAR_EDITOR_COMMAND,
} from './plugins/ClearEditorPlugin';
import { LexicalEditor } from 'lexical';
import OnChangePlugin from './plugins/OnChangePlugin';
import SetSingleBlockDecoratorNodePlugin, {
  SET_SINGLE_DECORATOR_BLOCK_COMMAND,
} from './plugins/SetSingleBlockDecoratorNodePlugin';
import {
  ZERO_WIDTH_CHARACTER,
  ZeroWidthNode,
  ZeroWidthWithIMEPlugin,
} from './plugins/ZeroWidthWithIMEPlugin';
import DisableInputWhenBlockNodeExist from './plugins/DisableInputWhenBlockNodeExist';

const validLeadingTextList = [
  '東京駅',
  '東京',
  '東',
  'とうきょうえき',
  'とうきょうえ',
  'とうきょう',
  'とうき',
  'とう',
  'と',
];

export const isValidQuery = (query: string) => {
  return validLeadingTextList.includes(query);
};

const onError = (error: unknown) => {
  console.error(error);
};

const MyContentEditable: React.FC<{ onBlur: FocusEventHandler }> = ({
  onBlur,
}) => (
  <ContentEditable
    className="z-10 relative p-2 border border-gray-400 outline-none focus:border-b-2 focus:border-blue-600 rounded"
    onBlur={onBlur}
  />
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
  onChange: (
    arg:
      | { type: 'text'; text: string }
      | { type: 'block'; blockInfo: string }
      | { type: 'decorator-block'; blockInfo: string }
      | null,
  ) => unknown;
  onInvalidInput: (type: string) => void;
  onInputComplete: () => void;
  onBlur: () => void;
}> = ({ editorRef, onChange, onInvalidInput, onInputComplete, onBlur }) => {
  const initialConfig: InitialConfigType = {
    editable: true,
    namespace: 'MyEditor',
    onError,
    nodes: [MyBlockDecoratorNode, ZeroWidthNode],
  };

  return (
    <div className="relative">
      <LexicalComposer initialConfig={initialConfig}>
        <PlainTextPlugin
          contentEditable={<MyContentEditable onBlur={onBlur} />}
          placeholder={<MyPlaceHolder>Enter some text...</MyPlaceHolder>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <EditorRefPlugin editorRef={editorRef} />
        <ProhibitLineBreakPlugin onInputComplete={onInputComplete} />
        <ClearEditorPlugin />
        <SetSingleBlockDecoratorNodePlugin />
        <ZeroWidthWithIMEPlugin textContent={ZERO_WIDTH_CHARACTER} />
        {
          // <EnsureExclusiveMyBlockNodePlugin />
          // <EnsureExclusiveMyDecoratorBlockNodePlugin />
        }
        <DisableInputWhenBlockNodeExist
          onInvalidInput={() => onInvalidInput('multi-query')}
        />
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
    setSingleBlockDecoratorNode: (
      text: string,
      blockInfo: string,
      disabled?: boolean,
      focus?: boolean,
    ) => {
      editorRef.current?.dispatchCommand<
        typeof SET_SINGLE_DECORATOR_BLOCK_COMMAND
      >(SET_SINGLE_DECORATOR_BLOCK_COMMAND, {
        text,
        blockInfo,
        disabled,
        focus,
      });
    },
  } as const;
  return [editorRef, controller] as const;
};

export default MyEditor;
export { useLexicalEditorControl };
