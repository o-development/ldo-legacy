import { ContextDefinition } from "jsonld";
import { Schema } from "shexj";

export type ShapeType<Type> = {
  schema: Schema;
  shape: string;
  context: ContextDefinition;
  // This field is optional. It's main point is to allow the typescript parser to
  // understand that this shape type is of a specific type.
  exampleData?: Type;
};
