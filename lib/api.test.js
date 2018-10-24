const strava = require('./api');

let oldEnv;
beforeAll(() => {
  oldEnv = process.env;
  process.env = {
    accessToken: 'test_access_token',
    clientId: 'test_client_id',
    clientSecret: 'test_client_secret',
    redirectUri: 'http://localhost/auth-success/',
  };
});
afterAll(() => {
  process.env = oldEnv; 
});

describe('login', () => {
  test('get log in URL', async () => {
    const authURL = await strava.getAuthURL();
    const parsedURL = new URL(authURL);
    expect(parsedURL.host).toBe('www.strava.com');
    expect(parsedURL.pathname).toBe('/oauth/authorize');
    expect(parsedURL.searchParams.get('client_id')).toBe(process.env.clientId);
    expect(parsedURL.searchParams.get('redirect_uri')).toBe(process.env.redirectUri);
    expect(parsedURL.searchParams.get('scope')).toBe('activity:read');
    expect(parsedURL.searchParams.get('response_type')).toBe('code');
  });
  test('store auth token', (done) => {
    done();     
  });
});
