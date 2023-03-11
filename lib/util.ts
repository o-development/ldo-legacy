import { namedNode } from "@rdfjs/data-model";
import { Dataset } from "@rdfjs/types";
import {
  ArrayProxy,
  getProxyFromObject,
  GraphType,
  ObjectType,
  PredicateType,
  SubjectProxy,
  SubjectType,
  _getUnderlyingDataset,
  _proxyContext,
} from "jsonld-dataset-proxy";
import { Quad } from "n3";
import { SubscribableDataset, TransactionalDataset } from "o-dataset-pack";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LdoBase = Record<string, any>;

/**
 * Converts a node/string into just a node
 * @param input A Node or string
 * @returns A node
 */
export function normalizeNodeName<
  NodeType extends SubjectType | PredicateType | ObjectType | GraphType
>(input: NodeType | string): NodeType {
  return (typeof input === "string" ? namedNode(input) : input) as NodeType;
}

/**
 * Converts an array of nodes/strings into an array of nodes
 * @param inputs An array of nodes/strings
 * @returns An array of nodes
 */
export function normalizeNodeNames<
  NodeType extends SubjectType | PredicateType | ObjectType | GraphType
>(inputs: (NodeType | string)[]): NodeType[] {
  return inputs.map((input) => normalizeNodeName<NodeType>(input));
}

export function canDatasetStartTransaction(
  dataset: Dataset
): dataset is SubscribableDataset<Quad> {
  return (
    typeof (dataset as SubscribableDataset).startTransaction === "function"
  );
}

export function isTransactionalDataset(
  dataset: Dataset
): dataset is TransactionalDataset<Quad> {
  return typeof (dataset as TransactionalDataset).commit === "function";
}

export function getTransactionalDatasetFromLdo(
  ldo: LdoBase
): [TransactionalDataset<Quad>, SubjectProxy | ArrayProxy] {
  const proxy = getProxyFromObject(ldo);
  const dataset = proxy[_getUnderlyingDataset];
  if (
    !isTransactionalDataset(dataset) ||
    !proxy[_proxyContext].state.parentDataset
  ) {
    throw new Error("Object is not currently in a transaction");
  }
  return [dataset, proxy];
}
