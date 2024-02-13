import {
  DecoratorNode,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  SerializedTextNode,
  TextNode,
} from 'lexical';
import { v4 as uuid } from 'uuid';
import { ReactNode } from 'react';
import ButtonStyleBlock from './MyButtonStyleBlock';

interface SerializedMyBlockNode extends SerializedTextNode {
  blockInfo: string;
}

interface SerializedMyDecoratorBlockNode extends SerializedLexicalNode {
  text: string;
  blockInfo: string;
  uid: string;
  disabled?: boolean;
}

class MyBlockNode extends TextNode {
  __blockInfo: string;

  constructor(text: string, blockInfo: string, key?: NodeKey) {
    super(text, key);
    this.__blockInfo = blockInfo;
  }

  getBlockInfo() {
    return this.__blockInfo;
  }

  static getType() {
    return 'my-block';
  }

  static clone(node: MyBlockNode): MyBlockNode {
    return new MyBlockNode(node.__text, node.__blockInfo, node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    element.classList.add('text-blue-600');
    return element;
  }

  updateDOM(
    prevNode: MyBlockNode,
    dom: HTMLElement,
    config: EditorConfig,
  ): boolean {
    const isUpdated = super.updateDOM(prevNode, dom, config);
    return isUpdated;
  }

  exportJSON(): SerializedMyBlockNode {
    return {
      ...super.exportJSON(),
      type: MyBlockNode.getType(),
      blockInfo: this.__blockInfo,
    };
  }

  static importJSON(json: SerializedMyBlockNode): MyBlockNode {
    return new MyBlockNode(json.text, json.blockInfo);
  }
}

const $createMyBlockNode = (text: string, blockInfo: string) => {
  const node = new MyBlockNode(text, blockInfo);
  node.setMode('token');
  return node;
};

const $isMyBlockNode = (
  node: LexicalNode | null | undefined,
): node is MyBlockNode => {
  return node instanceof MyBlockNode;
};

class MyBlockDecoratorNode extends DecoratorNode<ReactNode> {
  __text: string;
  __blockInfo: string;
  __uid: string;
  __disabled?: boolean;

  static getType(): string {
    return 'dcrtr';
  }

  static clone(node: MyBlockDecoratorNode): MyBlockDecoratorNode {
    return new MyBlockDecoratorNode(
      node.__text,
      node.__blockInfo,
      node.__uid,
      node.__disabled,
      node.__key,
    );
  }

  constructor(
    text: string,
    blockInfo: string,
    uid: string,
    disabled?: boolean,
    key?: NodeKey,
  ) {
    super(key);
    this.__text = text;
    this.__blockInfo = blockInfo;
    this.__uid = uid;
    this.__disabled = disabled;
  }

  getTextContent(): string {
    return this.__text;
  }

  getBlockInfo(): string {
    return this.__blockInfo;
  }

  getUid(): string {
    return this.__uid;
  }

  createDOM(): HTMLElement {
    return document.createElement('span');
  }

  updateDOM(): false {
    return false;
  }

  decorate(): ReactNode {
    return (
      <ButtonStyleBlock uid={this.__uid} disabled={this.__disabled}>
        {this.__text}
      </ButtonStyleBlock>
    );
  }

  exportJSON(): SerializedMyDecoratorBlockNode {
    return {
      type: MyBlockDecoratorNode.getType(),
      version: 1,
      text: this.__text,
      blockInfo: this.__blockInfo,
      uid: this.__uid,
      disabled: this.__disabled,
    };
  }

  static importJSON(
    json: SerializedMyDecoratorBlockNode,
  ): MyBlockDecoratorNode {
    return new MyBlockDecoratorNode(
      json.text,
      json.blockInfo,
      json.uid,
      json.disabled,
    );
  }
}

const $createMyBlockDecoratorNode = (
  text: string,
  blockInfo: string,
  disabled?: boolean,
) => {
  const uid = uuid();
  const node = new MyBlockDecoratorNode(text, blockInfo, uid, disabled);
  return node;
};

const $isMyBlockDecoratorNode = (
  node: LexicalNode | null | undefined,
): node is MyBlockDecoratorNode => {
  return node instanceof MyBlockDecoratorNode;
};

export {
  MyBlockNode,
  MyBlockDecoratorNode,
  $createMyBlockNode,
  $isMyBlockNode,
  $createMyBlockDecoratorNode,
  $isMyBlockDecoratorNode,
};
