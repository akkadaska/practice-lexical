import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isDecoratorNode,
  $isLineBreakNode,
  $isRangeSelection,
  $isTextNode,
  $nodesOfType,
  COMMAND_PRIORITY_EDITOR,
  KEY_ARROW_LEFT_COMMAND,
  LineBreakNode,
  SELECTION_CHANGE_COMMAND,
  TextNode,
} from 'lexical';
import { mergeRegister } from '@lexical/utils';
import {
  ZeroWidthNode,
  ZERO_WIDTH_CHARACTER,
  $isZeroWidthNode,
  $createZeroWidthNode,
} from './ZeroWidthNode';
import { useEffect, useRef } from 'react';

const ZeroWidthWithIMEPlugin: React.FC<{ textContent?: string }> = ({
  textContent = '',
}) => {
  const [editor] = useLexicalComposerContext();

  /**
   * Map to keep track of the zero width nodes and the nodes they are attached to.
   * Map<ZeroWidthNodeKey, AttachedNodeKey>
   */
  const zeroWidthNodeMap = useRef(new Map<string, string>());

  useEffect(() => {
    return mergeRegister(
      /*
        Check `TextNode` changes AFTER IME composition.
        Using `registerNodeTransform` is important to ensure no affect to the IME composition. This is mentioned in the Lexical Docs. see https://lexical.dev/docs/faq#how-do-i-listen-for-user-text-insertions .
      */
      editor.registerNodeTransform(TextNode, () => {
        editor.update(() => {
          const zeroWidthNodes = $nodesOfType(ZeroWidthNode);

          /*
            Remove unnecessary `ZeroWidthNode`.
           */
          const unnecessaryZeroWidthNodes = zeroWidthNodes.filter(
            (zeroWidthNode) => {
              const prevSibling = zeroWidthNode.getPreviousSibling();
              const nextSibling = zeroWidthNode.getNextSibling();

              const isAfterDecoratorNode = $isDecoratorNode(prevSibling);
              const isBeforeLineBreakNodeOrEndOfEditor =
                $isLineBreakNode(nextSibling) || !nextSibling;

              return (
                !isAfterDecoratorNode || !isBeforeLineBreakNodeOrEndOfEditor
              );
            },
          );

          /*
            Note that in this case, the `DecoratorNode` that is linked to `ZeroWidthNode` should not be removed because the reason of `ZeroWidthNode` removal is that it is just no longer needed.
            So, the map should update before removing the node to avoid removing `DecoratorNode` that is linked to `ZeroWidthNode` while the mutation listener of `ZeroWidthNode` is triggered.
            */
          unnecessaryZeroWidthNodes.forEach((removedZeroWidthNode) => {
            zeroWidthNodeMap.current.delete(removedZeroWidthNode.getKey());
          });

          unnecessaryZeroWidthNodes.forEach((removedZeroWidthNode) => {
            const nextSibling = removedZeroWidthNode.getNextSibling();
            removedZeroWidthNode.remove();

            /*
              // Workaround to unexpected selection behavior in Chrome when start typing Japanese "sokuon" (促音) . When typing "ttu" in Japanese, whole text ("っつ") will be selected unexpectedly.
            */
            const select = $getSelection();
            if (
              $isRangeSelection(select) &&
              !select.isCollapsed() &&
              select.getNodes().length === 1 &&
              select.getNodes().at(0) === nextSibling
            )
              nextSibling?.selectEnd();
          });
        });
      }),

      /*
        Cleanup and reassign `ZeroWidthNode` when some `DecoratorNode` has some changes.
      */
      editor.registerDecoratorListener((_decorators) => {
        editor.update(
          () => {
            const root = $getRoot();

            /*
              STEP 1: Remove `ZeroWidthNode` that has no valid link to `DecoratorNode`.
             */
            const zeroWidthNodes = $nodesOfType(ZeroWidthNode);

            zeroWidthNodes.forEach((zeroWidthNode) => {
              const zeroWidthNodeKey = zeroWidthNode.getKey();
              const linkedNodeKey =
                zeroWidthNodeMap.current.get(zeroWidthNodeKey);

              // Remove `ZeroWidthNode` if it is not defined in the map.
              if (!linkedNodeKey) {
                zeroWidthNodeMap.current.delete(zeroWidthNodeKey);
                zeroWidthNode.remove();
                return;
              }

              const previousSiblingKey = zeroWidthNode
                .getPreviousSibling()
                ?.getKey();

              // Remove `ZeroWidthNode` if the previous sibling is not the linked node.
              if (!previousSiblingKey || previousSiblingKey !== linkedNodeKey) {
                zeroWidthNodeMap.current.delete(zeroWidthNodeKey);
                zeroWidthNode.remove();
              }
            });

            /*
              STEP 2: Reassign `ZeroWidthNode` to the last `DecoratorNode` if exist.
             */

            const last = root.getLastDescendant();

            if ($isDecoratorNode(last)) {
              zeroWidthNodes.forEach((node) => node.remove()); // cleanup
              const zeroWidthNode = $createZeroWidthNode(textContent);
              last.insertAfter(zeroWidthNode);
              zeroWidthNodeMap.current.set(
                zeroWidthNode.getKey(),
                last.getKey(),
              );
            }

            /*
             * STEP 3: Add `ZeroWidthNode` before each line break if the previous sibling is `DecoratorNode`.
             */
            $nodesOfType(LineBreakNode).forEach((node) => {
              const prev = node.getPreviousSibling();
              if ($isDecoratorNode(prev)) {
                const zeroWidthNode = $createZeroWidthNode(textContent);
                node.insertBefore(zeroWidthNode);
                zeroWidthNodeMap.current.set(
                  zeroWidthNode.getKey(),
                  prev.getKey(),
                );
              }
            });
          },
          // merge with previous history entry to allow undoing
          { tag: 'history-merge' },
        );
      }),

      /*
        When `ZeroWidthNode` is destroyed, remove the linked `DecoratorNode` if exist.
        NOTE: lined `DecoratorNode` may not exist when the `ZeroWidthNode` is removed by the `TextNode` mutation listener.
      */
      editor.registerMutationListener(ZeroWidthNode, (mutation) => {
        const isDestroyed = Array.from(mutation.values()).some(
          (nodeMutation) => nodeMutation === 'destroyed',
        );

        if (!isDestroyed) {
          return;
        }

        editor.update(() => {
          const remainingZeroWidthNodesKey = $nodesOfType(ZeroWidthNode).map(
            (node) => node.getKey(),
          );

          const destroyedZeroWidthNodesKey = Array.from(
            zeroWidthNodeMap.current.keys(),
          ).filter((key) => !remainingZeroWidthNodesKey.includes(key));

          destroyedZeroWidthNodesKey.forEach((removedZeroWidthNodeKey) => {
            const shouldRemovedNodeKey = zeroWidthNodeMap.current.get(
              removedZeroWidthNodeKey,
            );

            if (!shouldRemovedNodeKey) {
              return;
            }

            const shouldRemovedNode = $getNodeByKey(shouldRemovedNodeKey);

            if (!shouldRemovedNode) {
              return;
            }

            const nextSibling = shouldRemovedNode.getNextSibling();

            /*
              In some cases, the `ZeroWidthNode` merged with the next `TextNode` and the `ZeroWidthNode` is removed before the `TextNode` mutation listener is triggered. At least, Safari on MacOS has this behavior.
  
              In this case, the linked `DecoratorNode` should not be removed while this linkage should be removed because it is no longer valid.
            */
            if (
              $isTextNode(nextSibling) &&
              nextSibling.getTextContent().startsWith(ZERO_WIDTH_CHARACTER)
            ) {
              zeroWidthNodeMap.current.delete(removedZeroWidthNodeKey);

              /*
                Workaround to leading letter duplicated with IME issue in Safari on MacOS.
              */
              const newTextNode = $createZeroWidthNode('');
              nextSibling.insertAfter(newTextNode);
              newTextNode.selectEnd();
              nextSibling.remove();
              return;
            }

            shouldRemovedNode.remove();
            zeroWidthNodeMap.current.delete(removedZeroWidthNodeKey);
          });
        });
      }),

      /*
        Avoid positioning the collapsed caret at the beginning of the `ZeroWidthNode` and select the ending instead.
      */
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          const selection = $getSelection();
          if (
            $isRangeSelection(selection) &&
            selection.isCollapsed() &&
            selection.anchor.offset === 0
          ) {
            const node = selection.getNodes().at(0);
            if ($isZeroWidthNode(node)) {
              node.selectEnd();
            }
            return false;
          }
          return false;
        },
        COMMAND_PRIORITY_EDITOR,
      ),

      /*
        Avoid positioning the collapsed caret at the beginning of the `ZeroWidthNode` and select the previous sibling ending instead when the left arrow key is pressed.
       */
      editor.registerCommand(
        KEY_ARROW_LEFT_COMMAND,
        () => {
          const selection = $getSelection();
          if ($isRangeSelection(selection) && selection.isCollapsed()) {
            const node = selection.anchor.getNode();
            if ($isZeroWidthNode(node)) {
              const previousSibling = node.getPreviousSibling();
              previousSibling?.selectEnd();
            }
          }
          return false;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
  }, [editor, textContent]);
  return null;
};

export {
  ZeroWidthWithIMEPlugin,
  ZeroWidthNode,
  ZERO_WIDTH_CHARACTER,
  $isZeroWidthNode,
};
