import { CxsDataTableColumn } from 'cerxos-ui';
import { FileRecordDto } from '../../../../shared/models/model';

export const FILE_COLUMNS: CxsDataTableColumn[] = [
  { key: 'fileName', label: 'File Name', sortable: true, filterable: true },
  {
    key: 'category',
    label: 'Category',
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { label: 'Image', value: 'Image' },
      { label: 'Video', value: 'Video' },
      { label: 'Audio', value: 'Audio' },
      { label: 'Document', value: 'Document' },
      { label: 'Other', value: 'Other' },
    ],
  },
  { key: 'contentType', label: 'Content Type' },
  { key: 'sizeBytes', label: 'Size', sortable: true },
  { key: 'uploadedBy', label: 'Uploaded By', sortable: true, filterable: true },
  { key: 'uploadedAt', label: 'Uploaded At', sortable: true },
  { key: 'actions', label: 'Actions', align: 'right' },
];

function formatBytes(bytes: number | undefined): string {
  if (bytes === undefined || bytes === 0) {
    return '0 B';
  }
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function toFileTableRow(file: FileRecordDto): Record<string, unknown> {
  return {
    id: file.id,
    fileName: file.originalFileName ?? '',
    category: file.category ?? '',
    contentType: file.contentType ?? '',
    sizeBytes: formatBytes(file.sizeBytes),
    uploadedBy: file.uploadedBy ?? '—',
    uploadedAt: file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : '—',
    url: file.url ?? '',
  };
}
