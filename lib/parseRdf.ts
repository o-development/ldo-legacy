import { Dataset } from "@rdfjs/types";
import { JsonLdDocument } from "jsonld";
import { ParserOptions } from "n3";
import { createDatasetFromSerializedInput } from "o-dataset-pack";
import { createLdoDataset, createLdoDatasetFactory } from "./createLdoDataset";
import { LdoDataset } from "./LdoDataset";

export async function parseRdf(
  data: string | JsonLdDocument | Dataset,
  parserOptions?: ParserOptions
): Promise<LdoDataset> {
  const ldoDatasetFactory = createLdoDatasetFactory();
  if (typeof data === "string") {
    // Input data is serialized
    return await createDatasetFromSerializedInput(
      ldoDatasetFactory,
      data,
      parserOptions
    );
  } else if (typeof (data as Dataset).add === "function") {
    // Input data is a dataset
    return createLdoDataset(data as Dataset);
  } else {
    return await createDatasetFromSerializedInput(
      ldoDatasetFactory,
      JSON.stringify(data),
      {
        format: "application/json-ld",
      }
    );
  }
}
