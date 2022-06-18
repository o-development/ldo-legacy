import { Dataset } from "@rdfjs/types";
import { Writer } from "n3";

export async function datasetToString(dataset: Dataset): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const writer = new Writer({ format: "N-Triples" });
    for (const quad of dataset) {
      writer.addQuad(quad);
    }
    writer.end(async (error, parsedString: string) => {
      if (error) {
        return reject(error);
      }
      return resolve(parsedString);
    });
  });
}
