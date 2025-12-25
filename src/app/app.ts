// app.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgClass, AsyncPipe } from '@angular/common';
import { BarcodeDetectionService } from '../services/BarcodeDetectionService';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgClass, AsyncPipe],
  template: `
    <div class="app-container flex flex-col">
      <!-- Header -->
      <header class="bg-gray-800 text-white shadow-md">
        <div class="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div class="flex items-center">
            <span class="material-icons mr-2">qr_code_scanner</span>
            <h1 class="text-xl font-bold">Product zoeker</h1>
          </div>
          <nav>
            <ul class="flex space-x-4 items-center">
              <li>
                <a href="https://github.com" target="_blank" class="hover:text-blue-300 transition-colors">
                  <span class="flex items-center">
                    <svg class="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <!-- Main content -->
      <main class="flex-grow overflow-y-auto">
        <router-outlet />
      </main>

      <!-- Footer -->
      <footer class="bg-gray-100 border-t border-gray-200 w-full">
        <div class="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div class="flex flex-col sm:flex-row justify-between items-center">
            <div class="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-0">
              <div class="flex items-center px-2 py-1 rounded-full relative group"
                   [ngClass]="barcodeApiSupported ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                <span class="inline-block h-2 w-2 rounded-full mr-1"
                      [ngClass]="barcodeApiSupported ? 'bg-green-500' : 'bg-yellow-500'"></span>
                {{ barcodeApiSupported ? 'Barcode API Ready' : 'Barcode API Not Supported' }}

                <!-- Tooltip showing supported formats -->
                <div *ngIf="barcodeApiSupported"
                     class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-gray-800 text-white text-xs rounded shadow-lg w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div class="font-bold mb-1">Supported Formats:</div>
                  <div>{{ supportedFormats | async }}</div>
                  <div class="absolute w-2 h-2 bg-gray-800 transform rotate-45 left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2"></div>
                </div>
              </div>
            </div>
            <div class="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm mt-2 sm:mt-0">
              <a href="#" class="text-gray-600 hover:text-gray-800 transition-colors">Hoe werkt het?</a>
              <a href="#" class="text-gray-600 hover:text-gray-800 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    /* Root container styling */
    :host {
      display: block;
      height: 100%;
    }

    .app-container {
      min-height: 100vh; /* Fallback */
      min-height: 100dvh; /* Modern browsers */
      height: 100%;
    }
  `]
})
export class App implements OnInit {
  protected readonly title = signal('barcode-lookup');
  barcodeApiSupported = false;
  private barcodeService = inject(BarcodeDetectionService);
  supportedFormats = this.barcodeService.getFormattedSupportedFormats();

  ngOnInit() {
    this.barcodeApiSupported = this.barcodeService.isSupported();
  }

  // Get current year for copyright notice
  get currentYear(): number {
    return new Date().getFullYear();
  }
}
