const { getConnector } = require('./dynamoconnector');
const { processMessage } = require('./statsprocessor');

exports.consume = async function (event, context) {
  dynamoConnector = getConnector();

  for (const record of event.Records) {
    try {
      let { body } = record;
      let msg = JSON.parse(body);
      await processMessage(msg, dynamoConnector);
    } catch (err) {
      console.warn(err);
    }
  }
};
