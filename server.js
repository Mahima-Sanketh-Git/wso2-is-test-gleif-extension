// Import the framework and instantiate it
import Fastify from 'fastify'
import fs from 'fs'
const fastify = Fastify({
  logger: true,
  https: {
    key: fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.crt')
  }
})

// Declare a route
fastify.post('/api/v1/lei-verification', async function handler (request, reply) {
    console.log(request.body);
    const response = await fetch("https://api.gleif.org/api/v1/lei-records/529900W18LQJJN6SJ336");

    const data = await response.json();
    console.log(data.data.attributes.registration.status);

   if (data.data.attributes.registration.status === "ISSUED") {
    return {
        "actionStatus": "SUCCESS",
        "operations": []
    }
   }

    return {
    "actionStatus": "RETRY",
    "operations": []
    }

})

// Run the server!
try {
  await fastify.listen({ port: 3000 })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}