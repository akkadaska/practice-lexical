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

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import {
  $getRoot,
  $getSelection,
  $isDecoratorNode,
  $isRangeSelection,
  $nodesOfType,
  COMMAND_PRIORITY_HIGH,
  KEY_DOWN_COMMAND,
  LineBreakNode,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { useEffect } from 'react';
import { $createFEFFNode, $isFEFFNode, FEFFNode } from './FEFFNode';

interface FEFFPluginProps {
  /**
   * Defines the return value of `getTextContent()`. By default, an empty string to not corrupt
   * the text content of the editor.
   *
   * Note: If other nodes are not at the correct position when inserting via `$insertNodes`,
   * try to use a non-empty string like " " or a zero-width character. But don't forget
   * to remove these characters when exporting the editor content.
   *
   * @default empty string
   */
  textContent?: string;
}

/**
 * This plugin serves as a patch to fix an incorrect cursor position in Safari.
 * It also ensures that the cursor is correctly aligned with the line height in
 * all browsers.
 * {@link https://github.com/facebook/lexical/issues/4487}.
 */
export function FEFFPlugin({ textContent }: FEFFPluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        // add a zero-width space node at the end if the last node is a decorator node
        editor.update(
          () => {
            const root = $getRoot();
            const last = root.getLastDescendant();
            // add FEFFNode at the end of the editor
            if ($isDecoratorNode(last)) {
              $nodesOfType(FEFFNode).forEach((node) => node.remove()); // cleanup
              last.insertAfter($createFEFFNode(textContent));
            }
            // add FEFFNode before each line break
            $nodesOfType(LineBreakNode).forEach((node) => {
              const prev = node.getPreviousSibling();
              if ($isDecoratorNode(prev)) {
                node.insertBefore($createFEFFNode(textContent));
              }
            });
          },
          // merge with previous history entry to allow undoing
          { tag: 'history-merge' },
        );
      }),
      editor.registerCommand(
        KEY_DOWN_COMMAND,
        (event) => {
          // prevent the unnecessary removal of the zero-width space, since this
          // would lead to the insertion of another zero-width space and thus break
          // undo with Ctrl+z
          if (event.ctrlKey || event.metaKey || event.altKey) {
            return false;
          }
          // remove the zero-width space if the user starts typing
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const node = selection.anchor.getNode();
            if ($isFEFFNode(node)) {
              node.remove();
            }
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          // select the previous node to avoid an error that occurs when the
          // user tries to insert a node directly after the zero-width space
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const node = selection.anchor.getNode();
            if ($isFEFFNode(node)) {
              node.selectPrevious();
            }
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH,
      ),
    );
  }, [editor, textContent]);

  return null;
}
