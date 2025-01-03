import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPlayListComponent } from './card-play-list.component';

describe('CardPlayListComponent', () => {
  let component: CardPlayListComponent;
  let fixture: ComponentFixture<CardPlayListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardPlayListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardPlayListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
