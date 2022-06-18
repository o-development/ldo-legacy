import { Dataset } from "@rdfjs/types";
import { DatasetChanges } from "o-dataset-pack";

export interface LdoMethods<Type> {
  $clone(): LinkedDataObject<Type>;
  $changes(): DatasetChanges;
  $dataset(): Dataset;
  $isValid(): boolean;
  $sparqlUpdate(): Promise<string>;
}

export type LinkedDataObject<Type> = Type & LdoMethods<Type>;
