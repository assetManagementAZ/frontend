import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class NumberConversionService {
  private farsiToEnglishMap: { [key: string]: string } = {
    '۰': '0',
    '۱': '1',
    '۲': '2',
    '۳': '3',
    '۴': '4',
    '۵': '5',
    '۶': '6',
    '۷': '7',
    '۸': '8',
    '۹': '9',
  };

  validateNumber(value: string): string {
    return value
      .split('')
      .map((char) => this.farsiToEnglishMap[char] || char)
      .join('');
  }
  isFarsiNumber(input: string): boolean {
    console.log('Raw Input:', JSON.stringify(input));
    console.log(
      'Unicode Values:',
      Array.from(input).map((c) => c.charCodeAt(0))
    );

    // Regular expression to match Farsi digits
    const farsiDigitRegex = /[\u06F0-\u06F9]/;

    // Normalize the input to NFC (Normalization Form Compatibility Composition)
    const normalizedInput = input.normalize('NFC');

    // Check if any character matches the Farsi digit range
    const match = normalizedInput.match(farsiDigitRegex);

    if (match) {
      console.log('MATCH', match);
    } else {
      console.log('NOT MATCH');
    }

    return !!match;
  }

  getNumberType(input: string): string {
    const hasFarsiDigits = this.isFarsiNumber(input);
    const hasArabicDigits = /[\u0660-\u0669]/.test(input);

    if (hasFarsiDigits && !hasArabicDigits) {
      return 'farsi';
    } else if (!hasFarsiDigits && hasArabicDigits) {
      return 'arabic';
    } else if (hasFarsiDigits && hasArabicDigits) {
      return 'mixed';
    } else {
      return 'english';
    }
  }
  constructor() {}
}
