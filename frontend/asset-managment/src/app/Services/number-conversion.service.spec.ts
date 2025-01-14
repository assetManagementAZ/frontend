import { TestBed } from '@angular/core/testing';

import { NumberConversionService } from './number-conversion.service';

describe('NumberConversionService', () => {
  let service: NumberConversionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NumberConversionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
