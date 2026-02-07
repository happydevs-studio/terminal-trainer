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
    const expectedAnswer = body.expectedAnswer || '';
    const userAnswer = body.userAnswer || '';
    const description = body.description || '';

    // Simple validation logic - check if the answers match (case-insensitive, trimmed)
    const correct = expectedAnswer.trim().toLowerCase() === userAnswer.trim().toLowerCase();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        correct: correct,
        expectedAnswer: expectedAnswer,
        description: description
      })
    };
  } catch (error) {
    console.error('Error in validate function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error', message: error.message })
    };
  }
};
