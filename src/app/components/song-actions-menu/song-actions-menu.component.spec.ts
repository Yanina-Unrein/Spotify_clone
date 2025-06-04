import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SongActionsMenuComponent } from './song-actions-menu.component';

describe('SongActionsMenuComponent', () => {
  let component: SongActionsMenuComponent;
  let fixture: ComponentFixture<SongActionsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongActionsMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SongActionsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
