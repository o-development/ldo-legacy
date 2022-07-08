import { Dataset } from "@rdfjs/types";
import { JsonLdDocument } from "jsonld";
import { WriterOptions } from "n3";
import { DatasetChanges } from "o-dataset-pack";

export interface LdoMethods<Type> {
  $clone(): LinkedDataObject<Type>;
  $changes(): DatasetChanges;
  $dataset(): Dataset;
  $isValid(): boolean;
  $toSparqlUpdate(): Promise<string>;
  $serialize(options: WriterOptions): Promise<string>;
  $toTurtle(): Promise<string>;
  $toJsonLd(): Promise<JsonLdDocument>;
  $toNTriples(): Promise<string>;
}

export type LinkedDataObject<Type> = Type & LdoMethods<Type>;
