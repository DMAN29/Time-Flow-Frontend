import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableDesignComponent } from './table-design.component';

describe('TableDesignComponent', () => {
  let component: TableDesignComponent;
  let fixture: ComponentFixture<TableDesignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableDesignComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableDesignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
