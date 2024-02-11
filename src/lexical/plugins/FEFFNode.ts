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
  DOMConversionOutput,
  DOMExportOutput,
  LexicalEditor,
  TextNode,
  type LexicalNode,
  type NodeKey,
  type SerializedTextNode,
} from 'lexical';
export const FEFF_CHARACTER = '\uFEFF';

export type SerializedFEFFNode = SerializedTextNode;

function convertFEFFElement(domNode: HTMLElement): DOMConversionOutput | null {
  return null;
}

/* eslint @typescript-eslint/no-unused-vars: "off" */
export class FEFFNode extends TextNode {
  static getType(): string {
    return 'FEFF';
  }

  static clone(node: FEFFNode): FEFFNode {
    return new FEFFNode(node.__textContent, node.__key);
  }

  static importJSON(_: SerializedFEFFNode): FEFFNode {
    return $createFEFFNode();
  }

  constructor(
    private __textContent: string,
    key?: NodeKey,
  ) {
    super(FEFF_CHARACTER, key);
  }

  exportJSON(): SerializedFEFFNode {
    return {
      ...super.exportJSON(),
      text: '',
      type: 'FEFF',
    };
  }

  updateDOM(): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return null;
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    return { element: null };
  }

  isTextEntity(): boolean {
    return true;
  }

  getTextContent(): string {
    return this.__textContent;
  }
}

export function $createFEFFNode(textContent = ''): FEFFNode {
  const newFEFFNode = new FEFFNode(textContent);

  // Prevents that a space that is inserted by the user is deleted again
  // directly after the input.
  newFEFFNode.setMode('segmented');

  return $applyNodeReplacement(newFEFFNode);
}

export function $isFEFFNode(
  node: LexicalNode | null | undefined,
): node is FEFFNode {
  return node instanceof FEFFNode;
}
