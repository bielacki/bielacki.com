// Command registry
const commands = {
    'help': () => {
        return `Available commands:
  help     - Show this help message
  clear    - Clear the terminal
  date     - Show current date
  exit     - Exit the terminal

Yes, that's all. I'm working on it.`;
    },
    'clear': () => {
        output.innerHTML = '';
        return null;
    },
    // Easter eggs
    'sudo': () => {
        return 'Nice try, but you have no power here.';
    },
    'matrix': () => {
        startMatrix();
        return 'Wake up, Neo...';
    },
    'exit': () => {
        window.location = 'about:blank';
        return null;
    },
    'rm -rf /': () => {
        startRmRf();
        return null;
    },
    'date': () => {
        return new Date().toString();
    }
};

// DOM elements
const output = document.querySelector('.output');
const inputDisplay = document.querySelector('.input-display');
const hiddenInput = document.querySelector('.hidden-input');
const terminal = document.querySelector('.terminal');

// Command history
let commandHistory = [];
let historyIndex = -1;

// Sync hidden input with display
hiddenInput.addEventListener('input', () => {
    inputDisplay.textContent = hiddenInput.value;
});

// Handle command submission and history navigation
hiddenInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const input = hiddenInput.value.trim();

        if (input) {
            // Add to history
            commandHistory.push(input);
            historyIndex = commandHistory.length;

            // Add command to output
            addOutput(input, 'command');

            // Process command
            const result = processCommand(input);
            if (result !== null) {
                addOutput(result, 'response');
            }
        }

        // Clear input
        hiddenInput.value = '';
        inputDisplay.textContent = '';
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            hiddenInput.value = commandHistory[historyIndex];
            inputDisplay.textContent = hiddenInput.value;
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            hiddenInput.value = commandHistory[historyIndex];
            inputDisplay.textContent = hiddenInput.value;
        } else {
            historyIndex = commandHistory.length;
            hiddenInput.value = '';
            inputDisplay.textContent = '';
        }
    }
});

// Process a command and return the result
function processCommand(input) {
    const cmd = input.toLowerCase().trim();

    if (commands.hasOwnProperty(cmd)) {
        return commands[cmd]();
    }

    return `command not found: ${input}`;
}

// Add a line to the output
function addOutput(text, type) {
    const line = document.createElement('div');
    line.className = `output-line ${type}`;
    line.textContent = text;
    output.appendChild(line);
    window.scrollTo(0, document.body.scrollHeight);
}

// Matrix effect
function startMatrix() {
    const matrixOverlay = document.createElement('div');
    matrixOverlay.className = 'matrix-overlay';
    matrixOverlay.innerHTML = '<canvas id="matrix-canvas"></canvas>';
    document.body.appendChild(matrixOverlay);

    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const rows = canvas.height / fontSize;
    const numColumns = Math.floor(columns);

    // Start drops at random negative positions
    const drops = Array(numColumns).fill(0).map(() => -Math.floor(Math.random() * rows));

    // Track active columns - start with ~1% active
    const active = Array(numColumns).fill(false).map(() => Math.random() < 0.01);
    const startTime = Date.now();
    const rampDuration = 5000; // 5 seconds to reach 100%

    // Start with black canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0F0';
        ctx.font = fontSize + 'px monospace';

        // Calculate target active percentage (1% to 100% over 10 seconds)
        const elapsed = Date.now() - startTime;
        const targetPercent = Math.min(1, 0.01 + (elapsed / rampDuration) * 0.99);
        const targetActive = Math.floor(numColumns * targetPercent);
        const currentActive = active.filter(a => a).length;

        // Activate more columns if needed (randomly chosen)
        if (currentActive < targetActive) {
            const toActivate = targetActive - currentActive;
            const inactiveIndices = active.map((a, i) => !a ? i : -1).filter(i => i !== -1);
            for (let j = 0; j < toActivate && inactiveIndices.length > 0; j++) {
                const randIndex = Math.floor(Math.random() * inactiveIndices.length);
                const colIndex = inactiveIndices.splice(randIndex, 1)[0];
                active[colIndex] = true;
                drops[colIndex] = -Math.floor(Math.random() * (rows / 2));
            }
        }

        for (let i = 0; i < drops.length; i++) {
            if (!active[i]) continue;

            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    const matrixInterval = setInterval(draw, 33);

    // Stop on click or keypress
    function stopMatrix() {
        clearInterval(matrixInterval);
        matrixOverlay.remove();
        document.removeEventListener('click', stopMatrix);
        document.removeEventListener('keydown', stopMatrix);
        hiddenInput.focus();
    }

    setTimeout(() => {
        document.addEventListener('click', stopMatrix);
        document.addEventListener('keydown', stopMatrix);
    }, 100);
}

// Fake rm -rf / effect
function startRmRf() {
    const fakeFiles = [
        '/bin/bash',
        '/etc/passwd',
        '/home/visitor/about.txt',
        '/home/visitor/projects/',
        '/usr/lib/libsystem.so',
        '/var/log/syslog',
        '/boot/vmlinuz',
        '/System/Library/CoreServices',
        '/home/visitor/.bashrc',
        '/usr/bin/node'
    ];

    let i = 0;
    hiddenInput.disabled = true;

    function deleteLine() {
        if (i < fakeFiles.length) {
            addOutput(`removing ${fakeFiles[i]}...`, 'response');
            i++;
            setTimeout(deleteLine, 150);
        } else {
            // Glitch effect
            setTimeout(() => {
                document.body.classList.add('glitch');
                addOutput('ERROR: Critical system failure', 'response');

                setTimeout(() => {
                    addOutput('KERNEL PANIC: Unable to mount root fs', 'response');

                    setTimeout(() => {
                        // Screen goes "corrupted"
                        document.body.classList.add('corrupted');

                        // Exit on click or keypress
                        function exitGlitch() {
                            document.body.classList.remove('glitch', 'corrupted');
                            output.innerHTML = '';
                            addOutput('Congrats hackerman, you broke nothing.', 'response');
                            hiddenInput.disabled = false;
                            hiddenInput.focus();
                            document.removeEventListener('click', exitGlitch);
                            document.removeEventListener('keydown', exitGlitch);
                        }

                        setTimeout(() => {
                            document.addEventListener('click', exitGlitch);
                            document.addEventListener('keydown', exitGlitch);
                        }, 100);
                    }, 800);
                }, 500);
            }, 300);
        }
    }

    deleteLine();
}

// Keep focus on input
document.addEventListener('click', () => {
    hiddenInput.focus();
});

// Initial focus
hiddenInput.focus();
