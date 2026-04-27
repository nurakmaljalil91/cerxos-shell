import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';

import { GroupsPage } from './groups-page';
import { GroupsService } from '../../services/groups.service';
import {
  BaseResponseOfGroupDto,
  BaseResponseOfPaginatedEnumerableOfGroupDto,
} from '../../../../shared/models/model';

describe('GroupsPage', () => {
  let component: GroupsPage;
  let fixture: ComponentFixture<GroupsPage>;
  let groupsServiceSpy: jasmine.SpyObj<
    Pick<GroupsService, 'getGroups' | 'updateGroup' | 'deleteGroup'>
  >;

  beforeEach(async () => {
    groupsServiceSpy = jasmine.createSpyObj('GroupsService', [
      'getGroups',
      'updateGroup',
      'deleteGroup',
    ]);

    await TestBed.configureTestingModule({
      imports: [GroupsPage],
      providers: [
        provideZonelessChangeDetection(),
        { provide: GroupsService, useValue: groupsServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupsPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const response: BaseResponseOfPaginatedEnumerableOfGroupDto = {
      success: true,
      data: {
        items: [],
        totalCount: 0,
      },
    };

    groupsServiceSpy.getGroups.and.returnValue(of(response));

    fixture.detectChanges();

    expect(groupsServiceSpy.getGroups).toHaveBeenCalledWith({
      page: 1,
      total: 1000,
      sortBy: 'name',
      descending: false,
    });
    expect(component).toBeTruthy();
  });

  it('should open edit group dialog with the selected group', () => {
    const response: BaseResponseOfPaginatedEnumerableOfGroupDto = {
      success: true,
      data: {
        items: [
          {
            id: 'group-1',
            name: 'Administrators',
            description: 'Full access',
            roles: [],
          },
        ],
        totalCount: 1,
      },
    };

    groupsServiceSpy.getGroups.and.returnValue(of(response));

    fixture.detectChanges();
    component.onEditGroup('group-1');

    expect(component.editGroupOpen()).toBeTrue();
    expect(component.editingGroupId()).toBe('group-1');
    expect(component.editGroupForm.getRawValue()).toEqual({
      name: 'Administrators',
      description: 'Full access',
    });
  });

  it('should submit edited group details', () => {
    const groupsResponse: BaseResponseOfPaginatedEnumerableOfGroupDto = {
      success: true,
      data: {
        items: [
          {
            id: 'group-1',
            name: 'Administrators',
            description: 'Full access',
            roles: [],
          },
        ],
        totalCount: 1,
      },
    };
    const updateResponse: BaseResponseOfGroupDto = {
      success: true,
      message: 'Group updated.',
      data: {
        id: 'group-1',
        name: 'Admins',
        description: 'Updated access',
      },
    };

    groupsServiceSpy.getGroups.and.returnValue(of(groupsResponse));
    groupsServiceSpy.updateGroup.and.returnValue(of(updateResponse));

    fixture.detectChanges();
    component.onEditGroup('group-1');
    component.editGroupForm.setValue({
      name: 'Admins',
      description: 'Updated access',
    });
    component.onSubmitEditGroup();

    expect(groupsServiceSpy.updateGroup).toHaveBeenCalledWith('group-1', {
      id: 'group-1',
      name: 'Admins',
      description: 'Updated access',
    });
    expect(component.editGroupOpen()).toBeFalse();
    expect(component.editingGroupId()).toBeNull();
  });

  it('should open delete group dialog with the selected group', () => {
    const response: BaseResponseOfPaginatedEnumerableOfGroupDto = {
      success: true,
      data: {
        items: [
          {
            id: 'group-1',
            name: 'Administrators',
            description: 'Full access',
            roles: [],
          },
        ],
        totalCount: 1,
      },
    };

    groupsServiceSpy.getGroups.and.returnValue(of(response));

    fixture.detectChanges();
    component.onDeleteGroup('group-1');

    expect(component.deleteGroupOpen()).toBeTrue();
    expect(component.deletingGroup()?.id).toBe('group-1');
    expect(component.deletingGroup()?.name).toBe('Administrators');
  });

  it('should delete the selected group when confirmed', () => {
    const groupsResponse: BaseResponseOfPaginatedEnumerableOfGroupDto = {
      success: true,
      data: {
        items: [
          {
            id: 'group-1',
            name: 'Administrators',
            description: 'Full access',
            roles: [],
          },
        ],
        totalCount: 1,
      },
    };
    const deleteResponse: BaseResponseOfGroupDto = {
      success: true,
      message: 'Group deleted.',
      data: {
        id: 'group-1',
        name: 'Administrators',
      },
    };

    groupsServiceSpy.getGroups.and.returnValue(of(groupsResponse));
    groupsServiceSpy.deleteGroup.and.returnValue(of(deleteResponse));

    fixture.detectChanges();
    component.onDeleteGroup('group-1');
    component.onConfirmDeleteGroup();

    expect(groupsServiceSpy.deleteGroup).toHaveBeenCalledWith('group-1');
    expect(component.deleteGroupOpen()).toBeFalse();
    expect(component.deletingGroup()).toBeNull();
  });

  it('should close delete group dialog without deleting', () => {
    const response: BaseResponseOfPaginatedEnumerableOfGroupDto = {
      success: true,
      data: {
        items: [
          {
            id: 'group-1',
            name: 'Administrators',
            description: 'Full access',
            roles: [],
          },
        ],
        totalCount: 1,
      },
    };

    groupsServiceSpy.getGroups.and.returnValue(of(response));

    fixture.detectChanges();
    component.onDeleteGroup('group-1');
    component.onCloseDeleteGroup();

    expect(groupsServiceSpy.deleteGroup).not.toHaveBeenCalled();
    expect(component.deleteGroupOpen()).toBeFalse();
    expect(component.deletingGroup()).toBeNull();
  });
});
