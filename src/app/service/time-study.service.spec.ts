import { TestBed } from '@angular/core/testing';

import { TimeStudyService } from './time-study.service';

describe('TimeStudyService', () => {
  let service: TimeStudyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimeStudyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
