
// get strava api tokens from env vars

const stravaWrapper = {
  getAuthURL: async () => {
    const { accessToken, clientId, clientSecret, redirectUri } = process.env;

    const authURL = new URL('https://www.strava.com/oauth/authorize');
    let params = [
      ['client_id', clientId],
      ['redirect_uri', redirectUri], 
      ['scope', 'activity:read'],
      ['response_type', 'code'],
    ];
    params.map(p => authURL.searchParams.append(p[0], p[1]));
    return authURL;
  }
}

module.exports = stravaWrapper;
