import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsideLibraryItemComponent } from './aside-library-item.component';

describe('AsideLibraryItemComponent', () => {
  let component: AsideLibraryItemComponent;
  let fixture: ComponentFixture<AsideLibraryItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsideLibraryItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsideLibraryItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
