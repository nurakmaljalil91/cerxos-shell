import { Pipe, PipeTransform } from '@angular/core';
import { heroIconHelper } from '../functions/hero-icon-helper.fx';

@Pipe({
  name: 'heroIconHelper',
  standalone: true,
  pure: true
})
export class HeroIconHelperPipe implements PipeTransform {
  transform(iconName: string): string[] {
    return heroIconHelper(iconName);
  }
}
