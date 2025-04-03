import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExistingOrderComponent } from './existing-order.component';

describe('ExistingOrderComponent', () => {
  let component: ExistingOrderComponent;
  let fixture: ComponentFixture<ExistingOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExistingOrderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExistingOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
