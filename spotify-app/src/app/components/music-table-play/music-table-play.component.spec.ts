import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicTablePlayComponent } from './music-table-play.component';

describe('MusicTablePlayComponent', () => {
  let component: MusicTablePlayComponent;
  let fixture: ComponentFixture<MusicTablePlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicTablePlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusicTablePlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
