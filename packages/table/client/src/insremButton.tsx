import React from "react";

type InsRemButtonProps = {
  onInsert: () => void;
  onRemove: () => void;
  dir?: "vertical" | "horizontal";
};

export const InsRemButton = ({
  dir = "horizontal",
  onInsert,
  onRemove,
}: InsRemButtonProps) => {
  return (
    <div style={dir === "horizontal" ? { display: "flex" } : {}}>
      <div>
        <button onClick={onInsert}>+</button>
      </div>
      <div>
        <button onClick={onRemove}>-</button>
      </div>
    </div>
  );
};
