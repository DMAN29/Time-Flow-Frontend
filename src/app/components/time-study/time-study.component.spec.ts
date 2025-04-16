import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeStudyComponent } from './time-study.component';

describe('TimeStudyComponent', () => {
  let component: TimeStudyComponent;
  let fixture: ComponentFixture<TimeStudyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeStudyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeStudyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
