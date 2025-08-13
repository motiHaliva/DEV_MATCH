

app.get('/stats', async (req, res) => {
  try {
    const users = await pool.query('SELECT COUNT(*) FROM users');
    const freelancers = await pool.query('SELECT COUNT(*) FROM freelancers');
    const projects = await pool.query('SELECT COUNT(*) FROM projects');
    console.log(users,freelancers,projects);
    

    res.json({
      users: users.rows[0].count,
      freelancers: freelancers.rows[0].count,
      projects: projects.rows[0].count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
