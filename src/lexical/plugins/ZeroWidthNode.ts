/*
 * This section of the code is based on the source code from lexical-beautiful-mentions (https://github.com/sodenn/lexical-beautiful-mentions).
 * The original code is copyrighted by Dennis Soehnen and provided under the MIT License.
 * Below is the full text of the license.
 *
 * MIT License

 * Copyright (c) 2023 Dennis Soehnen
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {
  $applyNodeReplacement,
  DOMConversionMap,
  DOMExportOutput,
  LexicalEditor,
  TextNode,
  type LexicalNode,
  type NodeKey,
  type SerializedTextNode,
} from 'lexical';
export const ZERO_WIDTH_CHARACTER = '\uFEFF';

export type SerializedZeroWidthNode = SerializedTextNode;

export class ZeroWidthNode extends TextNode {
  static getType(): string {
    return 'zeroWidth';
  }

  static clone(node: ZeroWidthNode): ZeroWidthNode {
    return new ZeroWidthNode(node.__textContent, node.__key);
  }

  static importJSON(_: SerializedZeroWidthNode): ZeroWidthNode {
    return $createZeroWidthNode();
  }

  constructor(
    private __textContent: string,
    key?: NodeKey,
  ) {
    super(ZERO_WIDTH_CHARACTER, key);
  }

  exportJSON(): SerializedZeroWidthNode {
    return {
      ...super.exportJSON(),
      text: '',
      type: 'zeroWidth',
    };
  }

  updateDOM(): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return null;
  }

  exportDOM(_editor: LexicalEditor): DOMExportOutput {
    return { element: null };
  }

  isTextEntity(): boolean {
    return true;
  }

  getTextContent(): string {
    return this.__textContent;
  }
}

export function $createZeroWidthNode(textContent = ''): ZeroWidthNode {
  const zeroWidthNode = new ZeroWidthNode(textContent);

  // Prevents that a space that is inserted by the user is deleted again
  // directly after the input.
  zeroWidthNode.setMode('segmented');

  return $applyNodeReplacement(zeroWidthNode);
}

export function $isZeroWidthNode(
  node: LexicalNode | null | undefined,
): node is ZeroWidthNode {
  return node instanceof ZeroWidthNode;
}
