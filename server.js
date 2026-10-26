const app = require('./server/app');
const { connectDB, seedProperties } = require('./server/config/database');

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  connectDB()
    .then(async () => {
      await seedProperties();
      app.listen(PORT, () => {
        console.log(`EstateX server running on http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error('Failed to start server:', error.message);
      process.exit(1);
    });
}

module.exports = app;
