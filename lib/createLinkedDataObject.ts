import { BlankNode, Dataset, NamedNode, Quad } from "@rdfjs/types";
import jsonldDatasetProxy from "jsonld-dataset-proxy";
import { LdoMethods, LinkedDataObject } from "./LinkedDataObject";
import {
  createSubscribableDataset,
  DatasetChanges,
  TransactionalDataset,
} from "o-dataset-pack";
import { datasetToString } from "./datasetToString";
import { ShapeType } from "./ShapeType";

export function createLinkedDataObject<Type>(
  dataset: TransactionalDataset<Quad>,
  entryNode: NamedNode | BlankNode,
  shapeType: ShapeType<Type>
): LinkedDataObject<Type> {
  const proxy = jsonldDatasetProxy<Type>(dataset, shapeType.context, entryNode);
  const ldoMethods = getLdoMethods<Type>(dataset, entryNode, shapeType);
  return new Proxy(proxy as unknown as object, {
    get(target: object, key: string | symbol) {
      // @ts-expect-error key casting required for methods
      if (ldoMethods[key]) {
        // @ts-expect-error key casting required for methods
        return ldoMethods[key];
      }
      // @ts-expect-error key casting required for methods
      return target[key];
    },
  }) as LinkedDataObject<Type>;
}

function getLdoMethods<Type>(
  dataset: TransactionalDataset<Quad>,
  entryNode: NamedNode | BlankNode,
  shapeType: ShapeType<Type>
): LdoMethods<Type> {
  return {
    $clone(): LinkedDataObject<Type> {
      const subscribableDataset = createSubscribableDataset();
      subscribableDataset.addAll(dataset);
      return createLinkedDataObject(
        subscribableDataset.startTransaction(),
        entryNode,
        shapeType
      );
    },
    $changes(): DatasetChanges {
      return dataset.getChanges();
    },
    $dataset(): Dataset {
      return dataset;
    },
    $isValid(): boolean {
      throw new Error("Not Implemented");
    },
    async $sparqlUpdate(): Promise<string> {
      const changes = dataset.getChanges();
      let output = "";
      if (changes.added) {
        output += `INSERT DATA { ${await datasetToString(changes.added)} }`;
      }
      if (changes.added && changes.removed) {
        output += "; ";
      }
      if (changes.removed) {
        output += `DELETE DATA { ${await datasetToString(changes.removed)} }`;
      }
      return output;
    },
  };
}
