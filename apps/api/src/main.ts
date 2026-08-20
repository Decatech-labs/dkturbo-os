import Fastify from 'fastify';

const app = Fastify({
  logger: true,
});

app.get('/health/live', async () => ({
  status: 'ok',
}));

app.get('/health/ready', async () => ({
  status: 'ready',
}));

const start = async (): Promise<void> => {
  try {
    await app.listen({
      host: '127.0.0.1',
      port: 3001,
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

await start();
