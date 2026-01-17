import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;
  let getItemSpy: jasmine.Spy;
  let setItemSpy: jasmine.Spy;
  let removeItemSpy: jasmine.Spy;

  const TOKEN_KEY = 'auth_token';
  const REFRESH_TOKEN_KEY = 'refresh_token';

  beforeEach(() => {
    getItemSpy = spyOn(localStorage, 'getItem').and.returnValue(null);
    setItemSpy = spyOn(localStorage, 'setItem');
    removeItemSpy = spyOn(localStorage, 'removeItem');

    service = new TokenService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('get() should call localStorage.getItem with correct key', () => {
    service.get();
    expect(getItemSpy).toHaveBeenCalledWith(TOKEN_KEY);
  });

  it('set() should store token in localStorage and update signal', () => {
    service.set('abc123');

    expect(setItemSpy).toHaveBeenCalledWith(TOKEN_KEY, 'abc123');
    expect(service.token()).toBe('abc123');
  });

  it('setRefreshToken() should store refresh token in localStorage', () => {
    service.setRefreshToken('refresh-abc');

    expect(setItemSpy).toHaveBeenCalledWith(REFRESH_TOKEN_KEY, 'refresh-abc');
  });

  it('getRefreshToken() should call localStorage.getItem with refresh token key', () => {
    service.getRefreshToken();

    expect(getItemSpy).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);
  });

  it('clear() should remove token from localStorage and update signal to null', () => {
    service.set('abc123'); // set something first

    service.clear();

    expect(removeItemSpy).toHaveBeenCalledWith(TOKEN_KEY);
    expect(removeItemSpy).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);
    expect(service.token()).toBeNull();
  });

  it('initial signal value should reflect value from localStorage', () => {
    // Rebuild service with a different getItem behavior
    getItemSpy.and.returnValue('stored-token');

    const svc2 = new TokenService();

    expect(localStorage.getItem).toHaveBeenCalledWith(TOKEN_KEY);
    expect(svc2.token()).toBe('stored-token');
  });
});
