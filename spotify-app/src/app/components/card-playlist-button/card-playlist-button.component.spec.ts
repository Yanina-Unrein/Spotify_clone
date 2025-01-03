import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPlaylistButtonComponent } from './card-playlist-button.component';

describe('CardPlaylistButtonComponent', () => {
  let component: CardPlaylistButtonComponent;
  let fixture: ComponentFixture<CardPlaylistButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardPlaylistButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardPlaylistButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
