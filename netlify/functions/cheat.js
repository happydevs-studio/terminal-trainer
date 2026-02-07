const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    // Get topic from query parameters
    const topic = event.queryStringParameters?.topic || 'linux';

    // Read the knowledge file
    const knowledgeFile = path.join(__dirname, '../../knowledge', `${topic}.json`);
    
    if (!fs.existsSync(knowledgeFile)) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: `Topic not found: ${topic}` })
      };
    }

    const knowledgeData = JSON.parse(fs.readFileSync(knowledgeFile, 'utf8'));
    
    // Convert to commands format
    const commands = [];
    if (knowledgeData.commands) {
      for (const cmd of knowledgeData.commands) {
        commands.push({
          command: cmd.command,
          description: cmd.description,
          category: knowledgeData.category || 'general'
        });
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        commands: commands,
        topic: topic
      })
    };
  } catch (error) {
    console.error('Error in cheat function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error', message: error.message })
    };
  }
};
