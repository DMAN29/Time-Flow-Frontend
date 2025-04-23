import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditOrderValueComponent } from './edit-order-value.component';

describe('EditOrderValueComponent', () => {
  let component: EditOrderValueComponent;
  let fixture: ComponentFixture<EditOrderValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditOrderValueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditOrderValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
