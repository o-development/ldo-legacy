import { BlankNode, Dataset, NamedNode, Quad } from "@rdfjs/types";
import jsonldDatasetProxy from "jsonld-dataset-proxy";
import { LdoMethods, LinkedDataObject } from "./LinkedDataObject";
import {
  createSubscribableDataset,
  DatasetChanges,
  TransactionalDataset,
} from "o-dataset-pack";
import { datasetToJsonLd, datasetToString } from "./datasetConverters";
import { ShapeType } from "./ShapeType";
import { JsonLdDocument } from "jsonld";
import { WriterOptions } from "n3";

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
    /**
     * Clone
     */
    $clone(): LinkedDataObject<Type> {
      const subscribableDataset = createSubscribableDataset();
      subscribableDataset.addAll(dataset);
      return createLinkedDataObject(
        subscribableDataset.startTransaction(),
        entryNode,
        shapeType
      );
    },

    /**
     * Changes
     */
    $changes(): DatasetChanges {
      return dataset.getChanges();
    },

    /**
     * Dataset
     */
    $dataset(): Dataset {
      return dataset;
    },

    /**
     * isValid
     */
    $isValid(): boolean {
      throw new Error("Not Implemented");

      // // Transfer Quads into an N3 Datastore
      // const g = new Store();
      // dataset.forEach((quad) => {
      //   g.addQuad(quad);
      // });
      // // Validate
      // const validationResult = ShexValidator.construct(
      //   shapeType.schema,
      //   ctor(g),
      //   {}
      // ).validate([
      //   {
      //     node: entryNode.value,
      //     shape: shapeType.shape,
      //   },
      // ]);
      // return !validationResult.errors;
    },

    /**
     * toSparqlUpdate
     */
    async $toSparqlUpdate(): Promise<string> {
      const changes = dataset.getChanges();
      let output = "";
      if (changes.removed) {
        output += `DELETE DATA { ${await datasetToString(changes.removed, {
          format: "N-Triples",
        })} }`;
      }
      if (changes.added && changes.removed) {
        output += "; ";
      }
      if (changes.added) {
        output += `INSERT DATA { ${await datasetToString(changes.added, {
          format: "N-Triples",
        })} }`;
      }
      return output.replaceAll("\n", " ");
    },

    /**
     * Serialize
     */
    async $serialize(options: WriterOptions): Promise<string> {
      return datasetToString(dataset, options);
    },

    /**
     * toTurtle
     */
    async $toTurtle(): Promise<string> {
      return datasetToString(dataset, {});
    },

    /**
     * toJsonLd
     */
    async $toJsonLd(): Promise<JsonLdDocument> {
      return datasetToJsonLd(dataset, shapeType.context);
    },

    /**
     * toNTriples
     */
    async $toNTriples(): Promise<string> {
      return datasetToString(dataset, { format: "N-Triples" });
    },
  };
}
