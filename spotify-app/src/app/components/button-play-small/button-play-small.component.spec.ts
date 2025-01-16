import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonPlaySmallComponent } from './button-play-small.component';

describe('ButtonPlaySmallComponent', () => {
  let component: ButtonPlaySmallComponent;
  let fixture: ComponentFixture<ButtonPlaySmallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonPlaySmallComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonPlaySmallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
