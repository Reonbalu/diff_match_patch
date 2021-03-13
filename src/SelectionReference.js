import React from "react";
import { Reference } from "react-popper";

class VirtualSelectionReference {
  constructor(selection) {
    this.selection = selection;
  }

  getBoundingClientRect() {
    return this.selection.getRangeAt(0).getBoundingClientRect();
  }

  get clientWidth() {
    return this.getBoundingClientRect().width;
  }

  get clientHeight() {
    return this.getBoundingClientRect().height;
  }
}

const SelectionReference = ({ onSelect, children }) => (
  <Reference>
    {({ ref }) =>
      children(({ onMouseUp, ...rest } = {}) => ({
        ...rest,
        onMouseUp: (...args) => {
          let selection = window.getSelection();
          // console.log(selection);

          if (!selection.isCollapsed) {
            ref(new VirtualSelectionReference(selection));
            onSelect && onSelect(selection, ...args);
          }

          onMouseUp && onMouseUp(...args);
        }
      }))
    }
  </Reference>
);

export default SelectionReference;
