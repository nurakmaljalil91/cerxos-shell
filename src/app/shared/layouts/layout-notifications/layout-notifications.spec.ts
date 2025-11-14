import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutNotifications } from './layout-notifications';
import { provideZonelessChangeDetection } from '@angular/core';

describe('LayoutNotifications', () => {
  let component: LayoutNotifications;
  let fixture: ComponentFixture<LayoutNotifications>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutNotifications],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutNotifications);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
