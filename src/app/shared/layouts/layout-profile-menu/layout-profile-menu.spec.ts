import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutProfileMenu } from './layout-profile-menu';

describe('LayoutProfileMenu', () => {
  let component: LayoutProfileMenu;
  let fixture: ComponentFixture<LayoutProfileMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutProfileMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutProfileMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
