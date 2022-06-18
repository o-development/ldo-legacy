import { NamedNode, BlankNode, Dataset, Quad } from "@rdfjs/types";
import {
  createSubscribableDataset,
  serializedToSubscribableDataset,
  WrapperSubscribableDataset,
} from "o-dataset-pack";
import { createLinkedDataObject } from "./createLinkedDataObject";
import { LinkedDataObject } from "./LinkedDataObject";
import { ShapeType } from "./ShapeType";
import jsonldDatasetProxy from "jsonld-dataset-proxy";
import df from "@rdfjs/data-model";
import { ParserOptions } from "n3";
import { JsonLdDocument } from "jsonld";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class LdoFactory<Type extends Record<string, any>> {
  private shapeType: ShapeType<Type>;
  constructor(shapeType: ShapeType<Type>) {
    this.shapeType = shapeType;
  }

  public async parse(
    entryNodeInput: string | NamedNode | BlankNode,
    data: string | JsonLdDocument | Dataset,
    options?: ParserOptions
  ): Promise<LinkedDataObject<Type>> {
    let dataset: WrapperSubscribableDataset<Quad>;
    if (typeof data === "string") {
      // Input data is serialized
      dataset = await serializedToSubscribableDataset(data, options);
    } else if (typeof (data as Dataset).add === "function") {
      // Input data is a dataset
      dataset = createSubscribableDataset(data as Dataset);
    } else {
      dataset = await serializedToSubscribableDataset(JSON.stringify(data), {
        format: "application/json-ld",
      });
    }
    const entryNode =
      typeof entryNodeInput === "string"
        ? df.namedNode(entryNodeInput)
        : entryNodeInput;
    return createLinkedDataObject(
      dataset.startTransaction(),
      entryNode,
      this.shapeType
    );
  }

  public create(inputData: Type): LinkedDataObject<Type> {
    const dataset = createSubscribableDataset();
    const entryNode = inputData["@id"]
      ? df.namedNode(inputData["@id"])
      : df.blankNode();
    const proxy = jsonldDatasetProxy<Type>(
      dataset,
      this.shapeType.context,
      entryNode
    );
    Object.entries(inputData).forEach(([key, value]) => {
      proxy[<keyof Type>key] = value;
    });
    return createLinkedDataObject(
      dataset.startTransaction(),
      entryNode,
      this.shapeType
    );
  }
}
