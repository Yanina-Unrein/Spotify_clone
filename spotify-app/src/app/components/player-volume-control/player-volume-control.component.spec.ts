import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerVolumeControlComponent } from './player-volume-control.component';

describe('PlayerVolumeControlComponent', () => {
  let component: PlayerVolumeControlComponent;
  let fixture: ComponentFixture<PlayerVolumeControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerVolumeControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerVolumeControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
