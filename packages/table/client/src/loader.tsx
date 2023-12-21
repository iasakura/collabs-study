import { WebSocketNetwork } from "@collabs/ws-client";
import React, { useEffect, useRef, useState } from "react";
import { Table, TableDoc, TableKey, newId } from "./table";
import { CRuntime, CLazyMap, CText, CValueList } from "@collabs/collabs";

function makeBaseState(): Uint8Array {
  const colIds = [
    "9aee2944-79b7-43d8-9332-c78c129af41d",
    "dd24f009-8409-454f-a03d-e90acf5d60d8",
    "22e54e82-52db-43b7-b6d8-ca59c7486cb8",
  ];
  const rowIds = [
    "757c1dec-0b75-411e-9211-286c57742a8d",
    "b4283f01-7c0a-4816-8065-a7f33b3f4386",
    "56c58892-caff-4c0e-a2b1-a7dc69d9ae88",
  ];

  // Set up your CRuntime + Collabs (or AbstractDoc) as usual, but
  // with replicaID "BASE".
  const doc = new CRuntime({ debugReplicaID: "BASE" });
  const table: CLazyMap<[TableKey, TableKey], CText> = doc.registerCollab(
    "table",
    (init) => new CLazyMap(init, (v) => new CText(v))
  );
  const rowKeys: CValueList<TableKey> = doc.registerCollab(
    "rowKeys",
    (init) => new CValueList(init)
  );
  const colKeys: CValueList<TableKey> = doc.registerCollab(
    "colKeys",
    (init) => new CValueList(init)
  );
  doc.transact(() => {
    for (let i = 0; i < 3; ++i) {
      colKeys.push(colIds[i]);
      rowKeys.push(rowIds[i]);
    }
    for (let i = 0; i < 3; ++i) {
      for (let j = 0; j < 3; ++j) {
        const t = table.set([rowKeys.get(i), colKeys.get(j)]);
        t.push(`${i}-${j}`);
      }
    }
  });

  // Return the resulting saved state.
  return doc.save();
}

/**
 * React component that loads a RecipeDoc from the given docID,
 * using the given providers.
 *
 * This component also hides the recipe GUI until the doc's
 * initial load. That way, users don't see a confusing blank recipe.
 *
 * You can use this as a template for components that convert a docID
 * into a document of a concrete type.
 */
export function Loader({
  docID,
  wsNetwork,
}: {
  docID: string;
  wsNetwork: WebSocketNetwork;
}) {
  // Wait to show the current doc until it's loaded from the server.
  // In a real app, you would probably instead wait until it's loaded
  // from on-device storage.
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    return wsNetwork.on("Load", (e) => {
      if (e.doc === docRef.current) setLoaded(true);
    });
  }, []);

  // When docID changes, create the doc and subscribe it to providers.
  const docRef = useRef<TableDoc | null>(null);
  useEffect(() => {
    setLoaded(false);
    docRef.current = new TableDoc();
    docRef.current.load(makeBaseState());
    wsNetwork.subscribe(docRef.current, docID);
  }, [docID]);

  if (loaded && docRef.current != null) {
    return <Table doc={docRef.current} />;
  } else return <p>Loading...</p>;
}
