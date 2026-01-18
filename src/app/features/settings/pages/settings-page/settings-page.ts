import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  CxsButtonComponent,
  CxsCardComponent,
  CxsCheckboxComponent,
  CxsInputComponent,
  CxsSelectComponent,
  CxsToggleComponent,
} from 'cerxos-ui';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,selector: 'app-settings-page',
  imports: [
    CxsButtonComponent,
    CxsCardComponent,
    CxsToggleComponent,
    CxsCheckboxComponent,
    CxsInputComponent,
    CxsSelectComponent
  ],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.css',
})
export class SettingsPage {

}
