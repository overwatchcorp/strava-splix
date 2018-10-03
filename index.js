require('dotenv').config();
const fastify = require('fastify')({
	logger: true,
});
const strava = require('strava-v3');
const { Pool, Client } = require('pg');

// set up postgresql client
const pool = new Pool();

// get authorization URL
fastify.get('/auth', (req, res) => {
  const authURL = strava.oauth.getRequestAccessURL({ scope: 'public' });
  res.redirect(authURL);
});

updateTokenQuery = `INSERT INTO tokens (id, token) VALUES ($1, '$2')
  ON CONFLICT ($1)
    DO UPDATE SET token = '$2'`;

fastify.get('/auth-complete', (req, res) => {
  const code = req.query.code;
  strava.oauth.getToken(code, async (err, { athlete, access_token }, limits) => {
    await pool.query(updateTokenQuery, [athlete.id, access_token]);
    res.redirect('/');
  });
});

fastify.get('/', async (req, res) => {
  // fetch token from database
  const data = await pool.query('SELECT id, token FROM tokens');
  const { id, token } = data.rows[0];
  // fetch activities
  strava.athlete.listActivities({ id: id }, (err, activities, limits) => {
    const detailedMaps = [];
    activities.map(({ id }) => {
      strava.activities.get({ id }, (err, activity) => {
        detailedMaps.push(activity);
        if (detailedMaps.length === activities.length) {
          res.send(detailedMaps);
        }
      });
    });
  });
});

fastify.listen(3000, (err, addr) => {
  if (err) throw err;
  console.log(`listening on ${addr}`);
});
