import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsideItemMenuComponent } from './aside-item-menu.component';

describe('AsideItemMenuComponent', () => {
  let component: AsideItemMenuComponent;
  let fixture: ComponentFixture<AsideItemMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsideItemMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsideItemMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
