// Terminal Trainer Web Application
let currentQuiz = null;
let currentQuestionIndex = 0;
let correctAnswers = 0;
let commandHistory = [];
let historyIndex = -1;

const output = document.getElementById('output');
const input = document.getElementById('command-input');

// Initialize
window.addEventListener('load', () => {
    printWelcome();
    input.focus();
});

// Handle command input
input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const command = input.value.trim();
        if (command) {
            commandHistory.push(command);
            historyIndex = commandHistory.length;
            await handleCommand(command);
        }
        input.value = '';
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            input.value = commandHistory[historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            input.value = commandHistory[historyIndex];
        } else {
            historyIndex = commandHistory.length;
            input.value = '';
        }
    }
});

// Keep input focused
output.addEventListener('click', () => input.focus());

function printWelcome() {
    print('🚀 Welcome to Terminal Trainer Web!', 'success');
    print('');
    print('Type "help" to see available commands', 'info');
    print('Type "quiz linux" to start a Linux quiz', 'info');
    print('Type "cheat git" to see Git commands', 'info');
    print('');
}

function print(text, className = '') {
    const line = document.createElement('div');
    line.className = `output-line ${className}`;
    line.textContent = text;
    output.appendChild(line);
    scrollToBottom();
}

function printPromptLine(text, promptSymbol, promptColor) {
    const line = document.createElement('div');
    line.className = 'output-line';
    
    const prompt = document.createElement('span');
    prompt.style.color = promptColor;
    prompt.textContent = promptSymbol;
    
    line.appendChild(prompt);
    line.appendChild(document.createTextNode(' ' + text));
    output.appendChild(line);
    scrollToBottom();
}

function printCommand(command) {
    printPromptLine(command, '$', '#4ade80');
}

function printAnswer(answer) {
    printPromptLine(answer, '›', '#60a5fa');
}

function scrollToBottom() {
    const terminalBody = document.querySelector('.terminal-body');
    terminalBody.scrollTop = terminalBody.scrollHeight;
}

async function handleCommand(command) {
    // If in quiz mode, handle as answer
    if (currentQuiz && currentQuestionIndex < currentQuiz.questions.length) {
        printAnswer(command);
        await handleQuizAnswer(command);
        return;
    }

    printCommand(command);

    // Parse command
    const parts = command.toLowerCase().split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    switch (cmd) {
        case 'help':
            showHelp();
            break;
        case 'quiz':
            await startQuiz(args[0] || 'linux');
            break;
        case 'cheat':
            await showCheatSheet(args[0] || 'linux');
            break;
        case 'clear':
            clearTerminal();
            break;
        case 'quit':
        case 'exit':
            if (currentQuiz) {
                endQuiz();
            } else {
                print('👋 Thanks for using Terminal Trainer!', 'info');
                print('Refresh the page to start again.', 'info');
            }
            break;
        default:
            print(`❌ Unknown command: ${cmd}`, 'error');
            print('Type "help" for available commands', 'info');
            break;
    }
}

function showHelp() {
    print('');
    print('📚 Terminal Trainer Commands:', 'info');
    print('');
    print('  help                    - Show this help message', 'info');
    print('  quiz [topic]           - Start a quiz (default: linux)', 'info');
    print('  cheat [topic]          - Show cheat sheet (default: linux)', 'info');
    print('  clear                   - Clear terminal', 'info');
    print('  quit/exit              - Exit quiz or show goodbye', 'info');
    print('');
    print('📖 Available topics:', 'info');
    print('  linux, git, docker, kubectl, vscode', 'info');
    print('');
}

async function startQuiz(topic) {
    try {
        print('');
        print(`🎯 Starting ${topic} quiz...`, 'info');
        print('');

        const response = await fetch('/api/quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topic: topic,
                count: 0 // 0 means all questions
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to load quiz: ${response.statusText}`);
        }

        currentQuiz = await response.json();
        currentQuestionIndex = 0;
        correctAnswers = 0;

        print(`📝 Quiz loaded with ${currentQuiz.questions.length} questions!`, 'success');
        print('💡 Type your answers below. Type "quit" to exit.', 'info');
        print('');
        
        askNextQuestion();
    } catch (error) {
        print(`❌ Error starting quiz: ${error.message}`, 'error');
        currentQuiz = null;
    }
}

function askNextQuestion() {
    if (!currentQuiz || currentQuestionIndex >= currentQuiz.questions.length) {
        endQuiz();
        return;
    }

    const question = currentQuiz.questions[currentQuestionIndex];
    print(`Question ${currentQuestionIndex + 1}/${currentQuiz.questions.length}:`, 'question');
    print(`  ${question.Text}`, 'question');
    print('');
}

async function handleQuizAnswer(answer) {
    if (answer.toLowerCase() === 'quit' || answer.toLowerCase() === 'exit') {
        endQuiz();
        return;
    }

    const question = currentQuiz.questions[currentQuestionIndex];

    try {
        const response = await fetch('/api/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                expectedAnswer: question.ExpectedAnswer,
                userAnswer: answer,
                description: question.Description
            })
        });

        const result = await response.json();

        if (result.correct) {
            correctAnswers++;
            print(`✅ Correct! "${result.expectedAnswer}" - ${result.description}`, 'success');
        } else {
            print(`❌ Incorrect. The answer is "${result.expectedAnswer}" - ${result.description}`, 'error');
        }

        print('');
        currentQuestionIndex++;
        
        // Small delay before next question
        setTimeout(() => {
            if (currentQuestionIndex < currentQuiz.questions.length) {
                askNextQuestion();
            } else {
                endQuiz();
            }
        }, 500);

    } catch (error) {
        print(`❌ Error validating answer: ${error.message}`, 'error');
    }
}

function endQuiz() {
    if (!currentQuiz) return;

    const total = currentQuiz.questions.length;
    const percentage = (correctAnswers / total) * 100;

    print('');
    print('🏆 Quiz Complete!', 'success');
    print(`📊 Final Score: ${correctAnswers}/${total} (${percentage.toFixed(1)}%)`, 'info');
    print('');

    if (percentage >= 90) {
        print('🌟 Excellent! You\'re a command line expert!', 'success');
    } else if (percentage >= 70) {
        print('👍 Good work! Keep practicing!', 'success');
    } else {
        print('📚 Keep studying - practice makes perfect!', 'warning');
    }

    print('');
    print('Type "quiz [topic]" to start another quiz', 'info');
    print('');

    currentQuiz = null;
    currentQuestionIndex = 0;
    correctAnswers = 0;
}

async function showCheatSheet(topic) {
    try {
        print('');
        print(`📚 Loading ${topic} cheat sheet...`, 'info');
        print('');

        const response = await fetch(`/api/cheat?topic=${topic}`);
        
        if (!response.ok) {
            throw new Error(`Failed to load cheat sheet: ${response.statusText}`);
        }

        const data = await response.json();

        print(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'info');
        print(`${topic.toUpperCase()} COMMAND REFERENCE`, 'info');
        print(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'info');
        print('');

        data.commands.forEach((cmd) => {
            print(`🔧 ${cmd.command}`, 'success');
            print(`   ${cmd.description}`, 'info');
            print('');
        });

        print(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'info');
        print(`💡 Total commands: ${data.commands.length}`, 'info');
        print(`🎯 Try "quiz ${topic}" to test your knowledge!`, 'info');
        print('');

    } catch (error) {
        print(`❌ Error loading cheat sheet: ${error.message}`, 'error');
    }
}

function clearTerminal() {
    output.innerHTML = '';
    printWelcome();
}
