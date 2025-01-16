import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardCreatePlaylistComponent } from './card-create-playlist.component';

describe('CardCreatePlaylistComponent', () => {
  let component: CardCreatePlaylistComponent;
  let fixture: ComponentFixture<CardCreatePlaylistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardCreatePlaylistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardCreatePlaylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
