const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const topic = body.topic || 'linux';
    const count = body.count || 0;

    // Validate topic to prevent path traversal attacks
    if (!/^[a-z0-9-]+$/i.test(topic)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid topic name' })
      };
    }

    // Read the knowledge file from the same directory as the function
    const knowledgeFile = path.join(__dirname, 'knowledge', `${topic}.json`);
    
    if (!fs.existsSync(knowledgeFile)) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: `Topic not found: ${topic}` })
      };
    }

    const knowledgeData = JSON.parse(fs.readFileSync(knowledgeFile, 'utf8'));
    
    // Convert the knowledge data to questions format
    const questions = [];
    // Handle both 'commands' and 'shortcuts' properties
    const items = knowledgeData.commands || knowledgeData.shortcuts || [];
    
    for (const item of items) {
      questions.push({
        Text: item.question,
        ExpectedAnswer: item.command,
        Description: item.description,
        Category: knowledgeData.category || 'general'
      });
    }

    // Limit questions if count is specified
    const limitedQuestions = count > 0 && count < questions.length 
      ? questions.slice(0, count) 
      : questions;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        questions: limitedQuestions,
        topic: topic
      })
    };
  } catch (error) {
    console.error('Error in quiz function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error', message: error.message })
    };
  }
};
