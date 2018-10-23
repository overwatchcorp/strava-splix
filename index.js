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

getDetailedActivities = () => {
  return new Promise(async (resolve, reject) => {
    // fetch token from database
    const data = await pool.query('SELECT id, token FROM tokens');
    const { id, token } = data.rows[0];
    // fetch activities
    strava.athlete.listActivities({ id: id }, (listErr, activities, limits) => {
      if (listErr) reject(listErr);
      const actList = [];
      activities.map(({ id }) => {
        strava.activities.get({ id }, (activitiesErr, activity) => {
          if (activitiesErr) reject(activitiesErr);
          actList.push(activity);
          if (actList.length === activities.length) resolve(actList);
        });
      });
    });
  });
};

storeDetailedActivitiy = (activity) => {
  return new Promise((resolve, reject) => {
    const addActivityQuery = 'INSERT INTO rides (id, athlete_id, polyline) VALUES (\'$1\', \'$2\', \'$3\');'  
    await pool.query(addActivityQuery, [activity.id, activity.athlete.id, activity.map.polyline]);
    resolve();
  });
}

fastify.get('/', async (req, res) => {
  const activities = await getDetailedActivities();
  res.send(activities);
});

fastify.listen(3000, (err, addr) => {
  if (err) throw err;
  console.log(`listening on ${addr}`);
});
