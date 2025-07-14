import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilOptionsComponent } from './perfil-options.component';

describe('PerfilOptionsComponent', () => {
  let component: PerfilOptionsComponent;
  let fixture: ComponentFixture<PerfilOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilOptionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
