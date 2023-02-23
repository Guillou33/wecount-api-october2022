import parse from "csv-parse";
import fs from "fs";

export default abstract class AbstractBaseIngestor {
  
  constructor(private csvPath: string) {}
  
  protected csvParsed: any[];
  
  protected abstract formatCsvTypes(value: string, index: number): any;
  protected abstract csvLength: number;

  read(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      fs.readFile(this.csvPath, "utf8", (err, csvRawContent) => {
        if (err) {
          console.error("error reading File", err);
        }
        parse(
          csvRawContent,
          {
            delimiter: ";",
            from_line: 2,
            cast: (value, context) => {
              const valueFormatted = this.formatCsvTypes(value, context.index);
              return valueFormatted === "" ? undefined : valueFormatted;
            },
          },
          (err, output) => {
            if (err) {
              console.error("error parsing CSV", err);
            }
            this.csvParsed = output;
            resolve(this.csvParsed);
          }
        );
      });
    });
  }

  protected checkLength(line: any[], allowLonger: boolean = true): void {
    if (line.length !== this.csvLength) {
      let isBroken = true;
      if (line.length > this.csvLength) {
        line = line.slice(0, this.csvLength);
        isBroken = false;
      }
      if (isBroken) {
        console.log(
          `line broken : line length is ${line.length} instead of ${this.csvLength}`,
          line
        );
        throw new Error("Incorrect CSV parsing");
      }
    }
  }
}
