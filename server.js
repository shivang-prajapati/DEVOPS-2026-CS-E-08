const app = require('./server/app');

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`EstateX Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
