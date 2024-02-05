import {
  DecoratorNode,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  SerializedTextNode,
  TextNode,
} from 'lexical';
import { ReactNode } from 'react';
import ButtonStyleBlock from './MyButtonStyleBlock';

interface SerializedMyBlockNode extends SerializedTextNode {
  blockInfo: string;
}

interface SerializedMyDecoratorBlockNode extends SerializedLexicalNode {
  text: string;
  blockInfo: string;
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

  static getType(): string {
    return 'my-block-decorator';
  }

  static clone(node: MyBlockDecoratorNode): MyBlockDecoratorNode {
    return new MyBlockDecoratorNode(node.__text, node.__blockInfo, node.__key);
  }

  constructor(text: string, blockInfo: string, key?: NodeKey) {
    super(key);
    this.__text = text;
    this.__blockInfo = blockInfo;
  }

  getTextContent(): string {
    return this.__text;
  }

  getBlockInfo(): string {
    return this.__blockInfo;
  }

  createDOM(): HTMLElement {
    return document.createElement('span');
  }

  updateDOM(): false {
    return false;
  }

  decorate(): ReactNode {
    return <ButtonStyleBlock>{this.__text}</ButtonStyleBlock>;
  }

  exportJSON(): SerializedMyDecoratorBlockNode {
    return {
      ...super.exportJSON(),
      type: MyBlockNode.getType(),
      text: this.__text,
      blockInfo: this.__blockInfo,
    };
  }

  static importJSON(json: SerializedMyDecoratorBlockNode): MyBlockNode {
    return new MyBlockNode(json.text, json.blockInfo);
  }
}

const $createMyBlockDecoratorNode = (text: string, blockInfo: string) => {
  const node = new MyBlockDecoratorNode(text, blockInfo);
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
