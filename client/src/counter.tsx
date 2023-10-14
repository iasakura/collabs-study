import { AbstractDoc, CCounter, DocOptions } from "@collabs/collabs";
import { useCollab } from "@collabs/react";
import React from "react";

export class CounterDoc extends AbstractDoc {
  readonly counter: CCounter;

  constructor(options?: DocOptions) {
    super(options);
    this.counter = this.runtime.registerCollab(
      "counter",
      (init) => new CCounter(init)
    );
  }

  public increment = (): void => {
    this.counter.add(1);
  };

  public current = (): number => {
    return this.counter.value;
  };
}

export const Counter = ({ doc }: { doc: CounterDoc }) => {
  useCollab(doc.counter);

  return (
    <div>
      <div>counter: {doc.current()}</div>
      <button onClick={() => doc.increment()}>increment!</button>
    </div>
  );
};
