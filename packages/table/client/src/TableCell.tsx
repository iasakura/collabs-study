import { CText } from "@collabs/collabs";
import { useCollab } from "@collabs/react";
import React, { FormEvent, useCallback, useState } from "react";

export type TableCellProps = {
  cell: CText;
  onChange: (text: string) => void;
};

export const TableCell = ({ cell, onChange }: TableCellProps) => {
  useCollab(cell);

  const [editable, setEditable] = useState(false);

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // const data = new FormData(e.currentTarget);
    // onChange((data.get("input") as string | null) ?? "");
    setEditable((e) => !e);
  }, []);

  const toggleEditable = useCallback(() => setEditable((e) => !e), []);

  if (editable) {
    return (
      <div>
        <form onSubmit={(e) => handleSubmit(e)}>
          <input
            name="input"
            value={cell.toString()}
            onChange={(e) => onChange(e.target.value)}
          />
          <button type="submit">done</button>
        </form>
      </div>
    );
  } else {
    return <div onClick={toggleEditable}>{cell.toString()}</div>;
  }
};
