// Import the framework and instantiate it
import Fastify from 'fastify'
import fs from 'fs'
const fastify = Fastify({
  logger: true,
})

// Declare a route
fastify.post('/api/v1/lei-verification', async function handler (request, reply) {
    const {event} = request.body;

    const claims = event.flow.user.claims
    let lei;
    for (const claim of claims){
       if(claim.uri === ""){
        lei = claim.value;
       }
    }

    if(lei === undefined){
        return {
            "actionStatus": "FAILED",
            "failureReason": "Organization LEI is not valid for account creation.",
            "failureDescription": "Your Organization LEI is not valid for account creation. Please contact your Organization Administrator to update your Organization LEI."
          }
    }

    const response = await fetch(`https://api.gleif.org/api/v1/lei-records/${lei}`);

    const data = await response.json();

   if (data.data.attributes.registration.status === "ISSUED") {
    return {
        "actionStatus": "SUCCESS",
        "operations": []
    }
   }

    return {
      "actionStatus": "FAILED",
      "failureReason": "Organization LEI is not valid for account creation.",
      "failureDescription": "Your Organization LEI is not valid for account creation. Please contact your Organization Administrator to update your Organization LEI."
    }

})

// Run the server!
try {
  await fastify.listen({ port: 3000 , host: '0.0.0.0'})
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}