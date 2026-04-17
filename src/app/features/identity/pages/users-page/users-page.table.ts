import { CxsDataTableColumn } from 'cerxos-ui';
import { UserDto } from '../../../../shared/models/model';

export const USER_COLUMNS: CxsDataTableColumn[] = [
  { key: 'username', label: 'Username', filterable: true, sortable: true },
  { key: 'email', label: 'Email', sortable: true, filterable: true },
  { key: 'emailConfirm', label: 'Email Confirm' },
  { key: 'phoneNumber', label: 'Phone' },
  { key: 'phoneNumberConfirm', label: 'Phone Confirm' },
  { key: 'twoFactorEnabled', label: '2-FA' },
  { key: 'roles', label: 'Roles', filterable: true, sortable: true },
  {
    key: 'locked',
    label: 'Locked',
    align: 'right',
    filterable: true,
    sortable: true,
    filterType: 'select',
    filterOptions: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ],
  },
  {
    key: 'isDeleted',
    label: 'Deleted',
    align: 'right',
    filterable: true,
    sortable: true,
    filterType: 'select',
    filterOptions: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ],
  },
  { key: 'accessFailedCount', label: 'Access Failed Count' },
  { key: 'actions', label: 'Actions', align: 'right' },
];

export function toUserTableRow(user: UserDto): Record<string, unknown> {
  return {
    id: user.id ?? '',
    username: user.username ?? '',
    email: user.email ?? '',
    phoneNumber: user.phoneNumber ?? '',
    phoneNumberConfirm: user.phoneNumberConfirm ? 'Yes' : 'No',
    emailConfirm: user.emailConfirm ? 'Yes' : 'No',
    twoFactorEnabled: user.twoFactorEnabled ? 'Yes' : 'No',
    roles: user.roles?.length ? user.roles.join(', ') : undefined,
    locked: user.isLocked ? 'Yes' : 'No',
    isDeleted: user.isDeleted ? 'Yes' : 'No',
    accessFailedCount: user.accessFailedCount ?? 0,
    isLocked: user.isLocked ?? false,
  };
}
