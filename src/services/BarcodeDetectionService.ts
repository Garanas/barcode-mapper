// src/services/BarcodeDetectionService.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BarcodeDetectionService {
  private isBarcodeDetectionSupported: boolean;

  constructor() {
    // Check if the Barcode Detection API is supported
    this.isBarcodeDetectionSupported = 'BarcodeDetector' in window;
  }

  /**
   * Checks if the Barcode Detection API is supported in the current browser
   * @returns boolean indicating whether the API is supported
   */
  isSupported(): boolean {
    return this.isBarcodeDetectionSupported;
  }
}
