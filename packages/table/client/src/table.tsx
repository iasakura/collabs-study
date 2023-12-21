import React, { useCallback } from "react";
import {
  AbstractDoc,
  CLazyMap,
  CText,
  CValueList,
  DocOptions,
  InitToken,
} from "@collabs/collabs";
import { useCollab } from "@collabs/react";
import { v4 as uuid } from "uuid";
import { range } from "./util";
import { InsRemButton } from "./insremButton";
import { TableCell } from "./TableCell";

export type TableKey = string;

export const newId = (): TableKey => uuid();

const tableValueConstructor = (initToken: InitToken) => new CText(initToken);

export class TableDoc extends AbstractDoc {
  readonly rowKeys: CValueList<TableKey>;
  readonly colKeys: CValueList<TableKey>;
  readonly table: CLazyMap<[TableKey, TableKey], CText>;

  constructor(options?: DocOptions) {
    super(options);
    this.table = this.runtime.registerCollab(
      "table",
      (init) => new CLazyMap(init, tableValueConstructor)
    );
    this.rowKeys = this.runtime.registerCollab(
      "rowKeys",
      (init) => new CValueList(init)
    );
    this.colKeys = this.runtime.registerCollab(
      "colKeys",
      (init) => new CValueList(init)
    );
    this.table.on("Any", (e) => console.log(e));
  }

  insertRow = (idx: number) => {
    this.rowKeys.insert(idx, newId());
  };

  removeRow = (idx: number) => {
    this.rowKeys.delete(idx);
  };

  insertCol = (idx: number) => {
    this.colKeys.insert(idx, newId());
  };

  removeCol = (idx: number) => {
    this.colKeys.delete(idx);
  };

  setCell = (rowKey: TableKey, colKey: TableKey, text: string) => {
    const cell = this.table.getIfPresent([rowKey, colKey]);
    if (!cell) {
      throw Error("Why?");
    }
    cell.clear();
    cell.insert(0, text);
    console.log(cell);
  };
}

export const Table = ({ doc }: { doc: TableDoc }) => {
  useCollab(doc.table);
  useCollab(doc.rowKeys);
  useCollab(doc.colKeys);

  const nCols = doc.colKeys.length;
  const nRows = doc.colKeys.length;

  const onInsert = useCallback((dir: "row" | "col", idx: number) => {
    if (dir === "row") {
      doc.insertRow(idx);
    } else {
      doc.insertCol(idx);
    }
  }, []);

  const onRemove = useCallback((dir: "row" | "col", idx: number) => {
    if (dir === "row") {
      doc.removeRow(idx);
    } else {
      doc.removeCol(idx);
    }
  }, []);

  const onCellChange = useCallback(
    (rowKey: TableKey, colKey: TableKey, text: string) => {
      doc.setCell(rowKey, colKey, text);
    },
    []
  );

  console.log(doc.table.toString());

  return (
    <table border={1}>
      <tbody>
        <tr>
          <td></td>
          {range(nCols + 1).map((i) => (
            <td key={i}>
              <InsRemButton
                onInsert={() => onInsert("col", i)}
                onRemove={() => (i < nCols ? onRemove("col", i) : undefined)}
              />
            </td>
          ))}
        </tr>
        {doc.rowKeys.map((rowKey, r) => (
          <tr>
            {
              <td key={0}>
                <InsRemButton
                  onInsert={() => onInsert("row", r)}
                  onRemove={() => onRemove("row", r)}
                  dir="vertical"
                />
              </td>
            }
            {doc.colKeys.map((colKey, col) => (
              <td key={`${rowKey}-${colKey}`}>
                <TableCell
                  cell={doc.table.get([rowKey, colKey])}
                  onChange={(text) => onCellChange(rowKey, colKey, text)}
                />
              </td>
            ))}
          </tr>
        ))}
        <tr>
          {
            <td key={0}>
              <InsRemButton
                onInsert={() => onInsert("row", nRows)}
                onRemove={() => {}}
                dir="vertical"
              />
            </td>
          }
        </tr>
      </tbody>
    </table>
  );
};
