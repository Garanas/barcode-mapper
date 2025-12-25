// src/app/services/csv.service.ts
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as Papa from 'papaparse';

export interface CsvData {
  headers: string[];
  items: Map<string, string[]>;
}

@Injectable({
  providedIn: 'root'
})
export class CsvService {
  private csvData: CsvData = {
    headers: [],
    items: new Map<string, string[]>()
  };

  constructor() { }

  /**
   * Parse a CSV file and return an observable that emits when parsing is complete
   * @param file The CSV file to parse
   * @returns Observable that emits the parsed data when complete
   */
  parseCSV(file: File): Observable<CsvData> {
    const subject = new Subject<CsvData>();

    // Clear any existing data
    this.clearData();

    Papa.parse(file, {
      header: false,
      skipEmptyLines: true, transform: (value) => value.trim(),  // Automatically trim all values
      complete: (results) => {
        if (results.data.length > 0) {
          // Cast the results data to a more specific type
          const rows = results.data as string[][];

          // Extract headers from the first row (excluding the first column which is the ID)
          this.csvData.headers = rows[0].slice(1);

          // Process data rows (skip header row)
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row.length > 0) {
              const identifier = row[0];
              const data = row.slice(1);
              this.csvData.items.set(identifier, data);
            }
          }

          subject.next(this.csvData);
          subject.complete();
        } else {
          subject.error(new Error('CSV file is empty'));
        }
      },
      error: (error: any) => {
        subject.error(error);
      }
    });

    return subject.asObservable();
  }

  /**
   * Find items with identifiers that partially match the provided search term
   * @param partialId Partial identifier to search for
   * @param limit Maximum number of results to return (default: 5)
   * @returns Object containing matching items and headers
   */
  findByPartialIdentifier(partialId: string, limit: number = 5): { headers: string[], matches: Map<string, string[]> } {
    const matches = new Map<string, string[]>();
    const searchTerm = partialId.trim().toLowerCase();
    let matchCount = 0;

    console.log(`Searching for: "${searchTerm}" in ${this.csvData.items.size} items with limit: ${limit}`);

    // Iterate through all identifiers
    for (const [identifier, data] of this.csvData.items.entries()) {
      const lowerCaseIdentifier = identifier.toLowerCase();

      // Check if the identifier contains the search term (case insensitive)
      if (lowerCaseIdentifier === searchTerm || lowerCaseIdentifier.startsWith(searchTerm) || searchTerm.includes(lowerCaseIdentifier)) {
        console.log(`Match found: ${identifier}`);
        matches.set(identifier, data);
        matchCount++;

        // Stop after reaching the limit
        if (matchCount >= limit) {
          console.log(`Reached limit of ${limit} matches, stopping search`);
          break;
        }
      }
    }

    console.log(`Found ${matches.size} matches (limited to ${limit})`);

    return {
      headers: this.csvData.headers,
      matches
    };
  }



  /**
   * Clear all loaded CSV data
   */
  clearData(): void {
    this.csvData.headers = [];
    this.csvData.items.clear();
  }

  // In DataService.ts, add this method if it doesn't already exist
  getHeaders(): string[] {
    return this.csvData.headers;
  }
}
