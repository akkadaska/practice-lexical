import {
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
  TextNode,
} from 'lexical';

interface SerializedMyBlockNode extends SerializedTextNode {
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

export { MyBlockNode, $createMyBlockNode, $isMyBlockNode };
