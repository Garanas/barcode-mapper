// src/app/search/search.component.ts
import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { CsvService } from '../../services/DataService';
import { TextFormatterPipe } from '../../pipes/TextFormatterPipe';
import { KeyValuePipe, NgClass } from '@angular/common';
import { BarcodeDetectionService } from '../../services/BarcodeDetectionService';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [ReactiveFormsModule, KeyValuePipe, TextFormatterPipe, NgClass],
  template: `
    <div class="max-w-md mx-auto my-5 p-6 bg-white rounded-lg shadow-md border-2 border-blue-100">
      <h2 class="text-xl font-bold mb-4 text-gray-800">Zoeken</h2>

      <!-- Video preview for barcode scanning -->
      @if (isScanning) {
        <div class="mb-4 relative">
          <video #videoElement class="w-full h-48 object-cover rounded-lg"></video>
          <div
            class="absolute inset-0 border-2 rounded-lg pointer-events-none transition-colors duration-300"
            [ngClass]="barcodeDetected ? 'border-green-500 animate-pulse' : 'border-blue-500'"
          ></div>
        </div>
      }

      <!-- Integrated search input and barcode button -->
      <div class="mb-4 flex">
        <div class="relative flex-grow">
          <input
            type="number"
            [formControl]="searchControl"
            placeholder="Enter identifier..."
            class="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>

        <button
          type="button"
          (click)="backspace()"
          [class]="barcodeApiSupported ?
              'px-3 py-2 flex items-center bg-orange-300 hover:bg-orange-400 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 border-r border-gray-300' :
              'px-3 py-2 rounded-r-md flex items-center bg-orange-300 hover:bg-orange-400 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500'"
        >

            <span class="material-icons text-lg">backspace</span>
          </button>



        <!-- Barcode scanning button -->
        @if (barcodeApiSupported) {
          <button
            type="button"
            (click)="toggleBarcodeScanning()"
            class="px-3 py-2 rounded-r-md flex items-center justify-center"
            [ngClass]="isScanning ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'"
          >
            <span class="material-icons text-lg">{{ isScanning ? 'close' : 'qr_code_scanner' }}</span>
            <span class="sr-only">{{ isScanning ? 'Stop scanning' : 'Scan barcode' }}</span>
          </button>
        }
      </div>

      <!-- Hint message -->
      @if (!isScanning && !searchControl.value) {
        <div class="text-xs text-gray-500 mb-4">
          Zoeken naar een product nummer
        </div>
      } @else if (!isScanning && searchControl.value && searchControl.value.toString().length < 3) {
        <div class="text-xs text-gray-500 mb-4">
          Er moet minimaal 3 tekens zijn om te zoeken.
        </div>
      }
    </div>

    @if (searchAttempted) {
      <div class="max-w-md mx-auto my-5 p-6 bg-white rounded-lg shadow-md border-2 border-blue-100">
        @if (results.size > 1) {

            <h3 class="text-lg font-semibold mb-2 text-gray-700">Resultaten:</h3>
            <ul class="bg-white rounded-md ">
              @for (item of results | keyvalue; track item.key) {
                <li
                  (click)="selectItem(item.key)"
                  class="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0 "
                >
                  {{ item.key }} - <span class="text-xs">{{ item.value[1] | textFormatter }}</span>
                </li>
              }
            </ul>
        }

        @if (results.size === 1) {
            @for (item of results | keyvalue; track item.key) {
              <h4 class="text-lg font-medium mb-2 text-blue-600">{{ item.key }}</h4>
              <dl class="grid grid-cols-3 gap-x-4 gap-y-2">
                @for (value of item.value; track $index) {
                  @if (headers[$index]) {
                    <dt class="col-span-1 text-sm font-medium text-gray-600">{{ headers[$index] }}</dt>
                    <dd class="col-span-2 text-sm text-gray-800">{{ value | textFormatter }}</dd>
                  }
                }
              </dl>
            }
        }

        @if (searchAttempted && results.size === 0) {
          <div class="mt-4 px-4 py-2 text-gray-600">
            No results found.
          </div>
        }
    </div>
    }
  `,
  styles: [`
    @keyframes border-flash {
      0%, 100% { border-color: #3B82F6; } /* blue-500 */
      50% { border-color: #10B981; } /* green-500 */
    }

    .border-flash {
      animation: border-flash 1s ease-in-out;
    }
  `]
})

export class SearchComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;

  searchControl = new FormControl('');
  results = new Map<string, string[]>();
  searchAttempted = false;
  headers: string[] = [];
  exactSearch = false;
  barcodeApiSupported = false;
  isScanning = false;
  barcodeDetected = false;
  private barcodeSubscription: Subscription | null = null;
  private detectionResetTimeout: any = null;

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
      const stringified = value?.toString() || '';
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

  ngOnDestroy() {
    // Make sure to stop scanning and clean up when component is destroyed
    this.stopBarcodeScanning();
    if (this.barcodeSubscription) {
      this.barcodeSubscription.unsubscribe();
      this.barcodeSubscription = null;
    }

    // Clear any pending timeouts
    if (this.detectionResetTimeout) {
      clearTimeout(this.detectionResetTimeout);
    }
  }

  toggleBarcodeScanning() {
    if (this.isScanning) {
      this.stopBarcodeScanning();
    } else {
      this.startBarcodeScanning();
    }
  }

  startBarcodeScanning() {
    if (!this.barcodeApiSupported || this.isScanning) return;

    this.isScanning = true;
    this.barcodeDetected = false;
    this.cdr.detectChanges();

    // Wait for the video element to be available after change detection
    setTimeout(() => {
      // Start scanning and subscribe to barcode results
      this.barcodeSubscription = this.barcodeService.startScanning(this.videoElement).subscribe({
        next: (barcode) => {
          console.log('Barcode detected:', barcode);
          // Set the barcode value to the search input
          this.searchControl.setValue(barcode);

          // Show green flash effect
          this.barcodeDetected = true;
          this.cdr.detectChanges();

          // Reset the detection status after 2 seconds
          if (this.detectionResetTimeout) {
            clearTimeout(this.detectionResetTimeout);
          }

          this.detectionResetTimeout = setTimeout(() => {
            this.barcodeDetected = false;
            this.cdr.detectChanges();
          }, 2000);

          // Note: We don't stop scanning as per requirements
          // The user needs to manually stop the scanning
        },
        error: (error) => {
          console.error('Barcode scanning error:', error);
          this.isScanning = false;
          this.barcodeDetected = false;
          this.cdr.detectChanges();
        }
      });
    }, 0);
  }

  stopBarcodeScanning() {
    if (!this.isScanning) return;

    // Stop the barcode scanning service
    this.barcodeService.stopScanning();

    // Clean up subscription
    if (this.barcodeSubscription) {
      this.barcodeSubscription.unsubscribe();
      this.barcodeSubscription = null;
    }

    // Clear any pending timeouts
    if (this.detectionResetTimeout) {
      clearTimeout(this.detectionResetTimeout);
    }

    this.isScanning = false;
    this.barcodeDetected = false;
    this.cdr.detectChanges();
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

  backspace() {
    const value = this.searchControl.value;
    if (value === null || value === undefined) return;

    // Ensure we're working with a string representation
    let stringifiedValue = value.toString();

    // For numeric inputs, we need to handle the possibility that leading zeros were dropped
    // Check both with and without the "0" prefix
    if (stringifiedValue.startsWith('0200')) {
      stringifiedValue = stringifiedValue.substring(4);
      console.log(stringifiedValue);
    } else if (stringifiedValue.startsWith('200')) {
      // This handles cases where the input was a number and lost its leading zero
      stringifiedValue = stringifiedValue.substring(3);
      console.log(stringifiedValue);
    }

    if (stringifiedValue.length > 2) {
      // Reduce to first two characters
      this.searchControl.setValue(stringifiedValue.slice(0, 2));
    } else {
      // For 1-2 characters, set to empty string
      this.searchControl.setValue('');
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
