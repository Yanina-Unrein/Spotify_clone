import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtistDetailComponenComponent } from './artist-detail-componen.component';

describe('ArtistDetailComponenComponent', () => {
  let component: ArtistDetailComponenComponent;
  let fixture: ComponentFixture<ArtistDetailComponenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtistDetailComponenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArtistDetailComponenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
