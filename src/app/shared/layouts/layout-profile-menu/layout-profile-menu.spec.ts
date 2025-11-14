import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutProfileMenu } from './layout-profile-menu';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

describe('LayoutProfileMenu', () => {
  let component: LayoutProfileMenu;
  let fixture: ComponentFixture<LayoutProfileMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutProfileMenu],
      providers: [provideZonelessChangeDetection(), provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutProfileMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
