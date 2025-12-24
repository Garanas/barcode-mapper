// src/app/search/search.component.ts (modified)
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { CsvService } from '../../services/DataService';
import { TextFormatterPipe } from '../../pipes/TextFormatterPipe';
import { KeyValuePipe, NgClass } from '@angular/common';
import { BarcodeDetectionService } from '../../services/BarcodeDetectionService';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [ReactiveFormsModule, KeyValuePipe, TextFormatterPipe, NgClass],
  template: `
    <div class="max-w-md mx-auto my-5 p-6 bg-white rounded-lg shadow-md">
      <h2 class="text-xl font-bold mb-4 text-gray-800">Search Identifiers</h2>

      <!-- Barcode Detection API support status -->
      <div class="mb-3 p-2 rounded text-sm" [ngClass]="barcodeApiSupported ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
        Barcode Detection API: {{ barcodeApiSupported ? 'Supported' : 'Not supported' }}
      </div>

      <div class="mb-1">
        <input
          type="number"
          [formControl]="searchControl"
          placeholder="Enter identifier..."
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
      </div>

      <!-- Hint message -->
      <div class="text-xs text-gray-500 mb-4">
        @if (searchControl.value && searchControl.value.length < 3) {
          Please enter at least 3 characters to search
        } @else {
          Enter search term to find identifiers
        }
      </div>

      @if (results.size > 1) {
        <div class="mt-4">
          <h3 class="text-lg font-semibold mb-2 text-gray-700">Results:</h3>
          <ul class="bg-white rounded-md shadow-sm">
            @for (item of results | keyvalue; track item.key) {
              <li
                (click)="selectItem(item.key)"
                class="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
              >
                {{ item.key }} - <span class="text-xs">{{ item.value[1] | textFormatter }}</span>
              </li>
            }
          </ul>
        </div>
      }

      @if (results.size === 1) {
        <div class="mt-4">
          @for (item of results | keyvalue; track item.key) {
            <div class="bg-white rounded-md shadow-sm p-4">
              <h4 class="text-lg font-medium mb-2 text-blue-600">{{ item.key }}</h4>
              <dl class="grid grid-cols-3 gap-x-4 gap-y-2">
                @for (value of item.value; track $index) {
                  @if (headers[$index]) {
                    <dt class="col-span-1 text-sm font-medium text-gray-600">{{ headers[$index] }}</dt>
                    <dd class="col-span-2 text-sm text-gray-800">{{ value | textFormatter }}</dd>
                  }
                }
              </dl>
            </div>
          }
        </div>
      }

      @if (searchAttempted && results.size === 0) {
        <div class="mt-4 px-4 py-2 text-gray-600">
          No results found.
        </div>
      }
    </div>
  `
})
export class SearchComponent implements OnInit {
  searchControl = new FormControl('');
  results = new Map<string, string[]>();
  searchAttempted = false;
  headers: string[] = [];
  exactSearch = false;
  barcodeApiSupported = false;

  constructor(
    private csvService: CsvService,
    private cdr: ChangeDetectorRef,
    private barcodeService: BarcodeDetectionService
  ) {}

  ngOnInit() {
    // Check if Barcode Detection API is supported
    this.barcodeApiSupported = this.barcodeService.isSupported();

    // Set up the debounce for the search input
    this.searchControl.valueChanges.pipe(
      debounceTime(300), // 300ms delay
    ).subscribe(value => {
      const stringified  = value?.toString() || ''
      if (!stringified || stringified.trim().length < 3) {
        // Reset search results if less than 3 characters
        this.results = new Map<string, string[]>();
        this.searchAttempted = false;
        this.cdr.detectChanges();
      } else {
        this.search(stringified);
        this.cdr.detectChanges();
      }
    });

    // Initialize headers
    this.headers = this.csvService.getHeaders();
  }

  search(query: string) {
    if (query.trim() === '') {
      this.results = new Map<string, string[]>();
      this.searchAttempted = false;
      return;
    }

    // Only search if query has at least 3 characters or if it's an exact search
    if (query.trim().length >= 3 || this.exactSearch) {
      this.searchAttempted = true;

      // Use the exact identifier for single item searches
      if (this.exactSearch) {
        const searchResults = this.csvService.findByPartialIdentifier(query, 1);
        this.results = searchResults.matches;
        this.headers = searchResults.headers;
        this.exactSearch = false;
      } else {
        // Regular search with limit of 10
        const searchResults = this.csvService.findByPartialIdentifier(query, 10);
        this.results = searchResults.matches;
        this.headers = searchResults.headers;
      }

      this.cdr.detectChanges();
    } else {
      // Reset if query is too short
      this.results = new Map<string, string[]>();
      this.searchAttempted = false;
      this.cdr.detectChanges();
    }
  }

  selectItem(identifier: string) {
    // Set the selected value to the input
    this.searchControl.setValue(identifier);

    // Mark this as an exact search so we get a single result
    this.exactSearch = true;

    // Perform a search with the exact identifier to show details
    this.search(identifier);
    this.cdr.detectChanges();
  }
}
