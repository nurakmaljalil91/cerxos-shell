import { environment } from './environments/environment';

type AngularGlobal = typeof globalThis & {
  ngDevMode?: boolean;
};

const angularGlobal = globalThis as AngularGlobal;

if (typeof angularGlobal.ngDevMode === 'undefined') {
  angularGlobal.ngDevMode = !environment.production;
}
