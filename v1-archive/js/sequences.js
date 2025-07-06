// BREWSTER'S MTGO MISSION TERMINAL - Sequence Controller

import { AudioEngine } from './audio-engine.js';
import { StateMachine } from './state-machine.js';

export const SequenceController = {
    elements: null,
    appState: null,
    
    // Initialize controller
    init(elements, appState) {
        this.elements = elements;
        this.appState = appState;
        console.log('🎬 Sequence controller initialized');
    },
    
    // Type text with enhanced terminal effect
    async typeText(element, text, speed = 50, playSound = true, showCursor = false) {
        console.log(`🔤 typeText DEBUG: Starting typing for element:`, element, `text: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" (${text.length} chars), speed: ${speed}ms`);
        
        if (!element) {
            console.error('❌ typeText ERROR: Element is null or undefined');
            return;
        }
        
        element.textContent = '';
        element.classList.add('typing-effect');
        
        // Debug: Check if element styling is being applied
        const computedStyle = window.getComputedStyle(element);
        console.log(`🎨 typeText DEBUG: Element computed style - opacity: ${computedStyle.opacity}, display: ${computedStyle.display}, visibility: ${computedStyle.visibility}`);
        
        if (playSound) {
            AudioEngine.playEnhancedTyping(text.length * speed, text.length);
        }
        
        for (let i = 0; i < text.length; i++) {
            element.textContent = text.substring(0, i + 1);
            
            // Debug: Log progress every 10 characters
            if (i % 10 === 0) {
                console.log(`📝 typeText PROGRESS: ${i}/${text.length} chars - Current text: "${element.textContent.substring(0, 20)}..."`);
            }
            
            // Play terminal beep for each character
            if (playSound && i % 3 === 0) {
                AudioEngine.play('terminalTextBeep');
            }
            
            if (showCursor) {
                element.textContent += '█';
                await this.delay(speed);
                element.textContent = text.substring(0, i + 1);
            }
            
            await this.delay(speed);
        }
        
        element.classList.remove('typing-effect');
        console.log(`✅ typeText COMPLETE: Finished typing ${text.length} characters`);
    },
    
    // Intro sequence - Cinematic opening
    async runIntroSequence() {
        console.log('🎬 Starting intro sequence');
        
        // Start ambient computer hum
        AudioEngine.play('ambientHum');
        
        // Wait for phosphor glow animation
        console.log('⏱️ Waiting for phosphor glow...');
        await this.delay(2000);
        
        // Play CRT power on sound
        AudioEngine.play('crtPowerOn');
        
        // Show terminal welcome after glow completes
        const terminalWelcome = this.elements.displays.terminalWelcome;
        const welcomeText = this.elements.displays.welcomeText;
        
        terminalWelcome.classList.remove('hidden');
        
        // Terminal welcome messages
        const welcomeMessages = [
            '> CLASSIFIED SYSTEM ACCESS DETECTED',
            '> SCANNING BIOMETRIC SIGNATURE...',
            '> ',
            '> TERMINAL ID: LANGLEY-7734',
            '> SECURE CHANNEL: ESTABLISHED',
            '> ',
            '> Welcome, operative.',
            '> This terminal requires authentication.',
            '> ',
            '> Enter credentials to proceed:'
        ];
        
        // Type out welcome message line by line
        for (let i = 0; i < welcomeMessages.length; i++) {
            const message = welcomeMessages[i];
            if (i > 0) {
                welcomeText.innerHTML += '<br>';
            }
            
            // Create span for this line
            const lineSpan = document.createElement('span');
            welcomeText.appendChild(lineSpan);
            
            // Type the line
            await this.typeText(lineSpan, message, 40, true, false);
            
            // Small delay between lines
            await this.delay(200);
        }
        
        // Brief pause before transitioning
        console.log('⏱️ Brief pause before transition...');
        await this.delay(300);
        
        // Simple fade out and transition
        console.log('🎬 Transitioning to auth...');
        const introScreen = this.elements.screens.intro;
        introScreen.style.opacity = '0';
        introScreen.style.transition = 'opacity 0.5s ease-out';
        
        await this.delay(500);
        
        // Direct transition to auth
        StateMachine.transition('auth');
    },


    // Enhanced auth interface with proper timing and terminal-style CTA
    async runAuthFormReveal() {
        console.log('🎬 Starting sequential auth interface reveal');
        
        // Stage 1: Container and Header appear together
        const container = document.querySelector('.terminal-container');
        const header = document.querySelector('.terminal-header');
        const form = document.querySelector('.auth-form');
        
        console.log('🔍 Revealing container and header...');
        container.classList.remove('auth-container-hidden');
        container.classList.add('auth-container-reveal');
        header.classList.remove('auth-header-hidden');
        header.classList.add('auth-header-reveal');
        form.classList.remove('auth-form-hidden');
        form.classList.add('auth-form-reveal');
        
        // Beat - pause after container/header (increased to 1200ms for slower revelation)
        await this.delay(1200);
        
        // Stage 2: Operative Codename field
        const agentNameGroup = document.querySelector('#agent-name').closest('.form-group');
        console.log('🔍 Revealing Agent Name field...');
        if (agentNameGroup) {
            agentNameGroup.classList.remove('auth-stage-2-hidden');
            agentNameGroup.classList.add('auth-stage-2-reveal');
            console.log('✅ Agent Name revealed');
        }
        
        // Beat - wait for field to fully appear (increased to 1200ms)
        await this.delay(1200);
        
        // Stage 3: Security Code field
        const accessCodeGroup = document.querySelector('#access-code').closest('.form-group');
        console.log('🔍 Revealing Access Code field...');
        if (accessCodeGroup) {
            accessCodeGroup.classList.remove('auth-stage-3-hidden');
            accessCodeGroup.classList.add('auth-stage-3-reveal');
            console.log('✅ Access Code revealed');
        }
        
        // Beat - wait for field to fully appear (increased to 1200ms)
        await this.delay(1200);
        
        // Stage 4: Authentication button
        const submitButton = document.querySelector('#auth-submit');
        console.log('🔍 Revealing Submit Button...');
        if (submitButton) {
            submitButton.classList.remove('auth-stage-4-hidden');
            submitButton.classList.add('auth-stage-4-reveal');
            console.log('✅ Submit Button revealed');
        }
        
        // Beat - wait for button to fully appear (increased to 1200ms)
        await this.delay(1200);
        
        console.log('✅ Sequential auth interface reveal complete');
    },
    
    
    // Boot sequence (shortened)
    async runBootSequence() {
        const bootMessages = [
            'SECURE TERMINAL SYSTEM v3.7.2',
            'CONNECT → Establishing secure channel...',
            'VERIFY → Authentication successful',
            `Agent ${this.appState.agentName} recognized`,
            'TERMINAL READY.'
        ];
        
        const bootText = this.elements.displays.bootText;
        bootText.textContent = '';
        
        // Play boot sound
        AudioEngine.play('bootUp');
        
        for (let i = 0; i < bootMessages.length; i++) {
            const message = bootMessages[i];
            const line = document.createElement('div');
            line.className = 'boot-line';
            bootText.appendChild(line);
            
            await this.typeText(line, message, 30);
            
            // Play system status sounds for key messages
            if (message.includes('OK') || message.includes('AUTHORIZED') || message.includes('READY')) {
                AudioEngine.playSystemStatusChange('success');
            } else if (message.includes('CONNECT') || message.includes('VERIFY') || message.includes('ENCRYPT')) {
                AudioEngine.playSystemStatusChange('normal');
            }
            
            await this.delay(200);
        }
        
        // Transition to mission screen
        await this.delay(1000);
        StateMachine.transition('mission');
    },
    
    // Initialize enhanced mission screen with personal communication
    async initMissionScreen() {
        const startTime = Date.now();
        console.log('🎯 Starting enhanced mission screen initialization');
        
        // Add phosphor glow to all terminal text
        this.addPhosphorGlow();
        
        // Play ambient connection sound at mission start
        AudioEngine.play('connectionEstablish');
        
        // Get mission screen elements
        const transmissionDetection = document.getElementById('transmission-detection');
        const terminalCommunication = document.getElementById('terminal-communication');
        const progressiveChoices = document.getElementById('progressive-choices');
        const detectionStatus = document.getElementById('detection-status');
        const personalMessage = document.getElementById('personal-message');
        const signalBars = transmissionDetection.querySelectorAll('.bar');
        
        // Stage 1: Transmission Detection (4-5 seconds)
        console.log(`📡 Stage 1: Transmission Detection [${((Date.now() - startTime) / 1000).toFixed(1)}s]`);
        
        // Reveal transmission detection container
        transmissionDetection.classList.remove('mission-stage-1-hidden');
        transmissionDetection.classList.add('mission-stage-1-reveal');
        
        // Activate signal bars one by one (without bouncing yet)
        await this.delay(1200);
        for (let i = 0; i < signalBars.length; i++) {
            signalBars[i].classList.add('active');
            AudioEngine.play('beep');
            await this.delay(300);
        }
        
        // Start cascading bounce wave effect during scanning
        await this.delay(200); // Brief pause before wave starts
        this.startSignalWave(signalBars);
        
        // Update detection status
        await this.delay(800);
        detectionStatus.textContent = 'DECRYPTING...';
        AudioEngine.play('dataTransfer');
        console.log(`   Decrypting... [${((Date.now() - startTime) / 1000).toFixed(1)}s]`);
        
        await this.delay(1500);
        detectionStatus.textContent = 'TRANSMISSION READY';
        AudioEngine.play('success');
        console.log(`   Transmission ready [${((Date.now() - startTime) / 1000).toFixed(1)}s]`);
        
        // Stop bouncing when transmission is ready
        this.stopSignalWave(signalBars);
        
        // Stage 2: Personal Terminal Communication (6-8 seconds)
        await this.delay(1200);
        console.log(`💬 Stage 2: Personal Terminal Communication [${((Date.now() - startTime) / 1000).toFixed(1)}s]`);
        
        terminalCommunication.classList.remove('mission-stage-2-hidden');
        terminalCommunication.classList.add('mission-stage-2-reveal');
        AudioEngine.play('alert');
        
        // Smooth scroll to terminal communication
        await this.accessibleScrollToElement(terminalCommunication);
        
        // Type out personal message character by character
        await this.delay(1000);
        const agentName = localStorage.getItem('agentName') || 'OPERATIVE';
        const personalMessageText = `OPERATIVE ${agentName},

YOUR SERVICE RECORD: EXCEPTIONAL
YEARS IN FIELD: 36
MISSIONS COMPLETED: 173

COMMAND HAS SELECTED YOU FOR ONE FINAL ASSIGNMENT.
OPERATION: GOBLIN SURPRISE

YOU HAVE EARNED THE RIGHT TO CHOOSE YOUR FINAL MISSION:`;
        
        await this.typeText(personalMessage, personalMessageText, 40); // 40ms per character
        
        // Stage 3: Progressive Choice Interface
        await this.delay(1200);
        console.log(`⚡ Stage 3: Progressive Choice Interface [${((Date.now() - startTime) / 1000).toFixed(1)}s]`);
        
        progressiveChoices.classList.remove('mission-stage-3-hidden');
        progressiveChoices.classList.add('mission-stage-3-reveal');
        
        // Smooth scroll to progressive choices section
        await this.accessibleScrollToElement(progressiveChoices);
        
        // Stage 4: Option Alpha Text
        await this.delay(1200);
        console.log(`🔤 Stage 4: Option Alpha Text [${((Date.now() - startTime) / 1000).toFixed(1)}s]`);
        
        const optionAlphaSection = document.getElementById('option-alpha-section');
        const optionAlphaText = document.getElementById('option-alpha-text');
        
        // Clear text and reveal section
        optionAlphaText.textContent = '';
        optionAlphaSection.classList.remove('mission-stage-4-hidden');
        optionAlphaSection.classList.add('mission-stage-4-reveal');
        AudioEngine.play('beep');
        
        // Type out Option Alpha text (now decline mission)
        await this.delay(500);
        await this.typeText(optionAlphaText, 'OPTION ALPHA: HONORABLE DISCHARGE WITH RETIREMENT BONUS', 40);
        
        // Stage 5: Decline Button Materializes (new order)
        await this.delay(1200);
        console.log(`🟡 Stage 5: Decline Button Materializes [${((Date.now() - startTime) / 1000).toFixed(1)}s]`);
        
        const declineButton = document.getElementById('decline-button');
        declineButton.classList.remove('mission-stage-5-hidden');
        declineButton.classList.add('mission-stage-5-reveal');
        AudioEngine.play('dataTransfer');
        
        // Smooth scroll to decline button
        await this.accessibleScrollToElement(declineButton);
        
        // Stage 6: Option Bravo Text
        await this.delay(1200);
        console.log(`🔤 Stage 6: Option Bravo Text [${((Date.now() - startTime) / 1000).toFixed(1)}s]`);
        
        const optionBravoSection = document.getElementById('option-bravo-section');
        const optionBravoText = document.getElementById('option-bravo-text');
        
        // Clear text and reveal section
        optionBravoText.textContent = '';
        optionBravoSection.classList.remove('mission-stage-6-hidden');
        optionBravoSection.classList.add('mission-stage-6-reveal');
        AudioEngine.play('beep');
        
        // Type out Option Bravo text
        await this.delay(500);
        console.log(`🔤 DEBUG: About to type Option Bravo text, element:`, optionBravoText);
        console.log(`🔤 DEBUG: optionBravoText visibility:`, optionBravoText ? 'FOUND' : 'NOT FOUND');
        
        if (!optionBravoText) {
            console.error('❌ CRITICAL: optionBravoText element not found!');
            return;
        }
        
        await this.typeText(optionBravoText, 'OPTION BRAVO: ACCEPT FINAL MISSION', 40);
        
        // Stage 7: Accept Button Materializes (new order)
        await this.delay(1200);
        console.log(`🟢 Stage 7: Accept Button Materializes [${((Date.now() - startTime) / 1000).toFixed(1)}s]`);
        
        const acceptButton = document.getElementById('accept-button');
        acceptButton.classList.remove('mission-stage-7-hidden');
        acceptButton.classList.add('mission-stage-7-reveal');
        AudioEngine.play('success');
        
        // Smooth scroll to accept button
        await this.accessibleScrollToElement(acceptButton);
        
        // Stage 8: Final Prompt
        await this.delay(1200);
        console.log(`⌨️ Stage 8: Final Prompt [${((Date.now() - startTime) / 1000).toFixed(1)}s]`);
        
        const finalPrompt = document.getElementById('final-prompt');
        finalPrompt.classList.remove('mission-stage-8-hidden');
        finalPrompt.classList.add('mission-stage-8-reveal');
        AudioEngine.play('alert');
        
        // Smooth scroll to final prompt
        await this.accessibleScrollToElement(finalPrompt);
        
        // Optimize button sizing now that all content is revealed
        await this.delay(200); // Brief delay to ensure CSS is fully applied
        this.optimizeButtonSizing();
        
        // Enable touch/click input for mission choices (no longer keyboard only)
        this.missionInputEnabled = true;
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✅ Enhanced mission screen initialization complete - Total time: ${totalTime}s (target: 12-16s) - awaiting button clicks`);
        console.log(`🎮 Mission screen ready: Personal communication complete, progressive buttons revealed, touch input enabled`);
    },
    
    // Show deny sequence
    async showDenySequence() {
        const output = this.elements.displays.terminalOutput;
        output.textContent = '';
        output.style.display = 'block';
        
        const messages = [
            '> MISSION_STATUS: DENIED',
            '> INITIATING_ABORT_PROTOCOL...',
            '> SECURE_TRANSFER_EXECUTING....',
            '> val(funds=600_usd) deposited in #account:operative_secure',
            '> MISSION_ABORT: COMPLETE'
        ];
        
        for (const message of messages) {
            const line = document.createElement('div');
            line.className = 'terminal-line';
            
            if (message.includes('DENIED')) {
                line.style.color = 'var(--color-danger)';
            } else if (message.includes('COMPLETE')) {
                line.style.color = 'var(--color-secondary)';
            }
            
            output.appendChild(line);
            await this.typeText(line, message, 40);
            await this.delay(300);
        }
        
        // Transition to credits after delay
        await this.delay(2000);
        StateMachine.transition('credits');
    },
    
    // Show accept sequence
    async showAcceptSequence() {
        const output = this.elements.displays.terminalOutput;
        output.textContent = '';
        output.style.display = 'block';
        
        const messages = [
            '> MISSION_STATUS: ACCEPTED',
            '> CLEARANCE_LEVEL: VERIFIED',
            '> ACCESSING_CLASSIFIED_BRIEFING.....',
            '> BRIEFING_READY'
        ];
        
        for (const message of messages) {
            const line = document.createElement('div');
            line.className = 'terminal-line';
            
            if (message.includes('ACCEPTED')) {
                line.style.color = 'var(--color-accent)';
            }
            
            output.appendChild(line);
            await this.typeText(line, message, 40);
            await this.delay(300);
        }
        
        // Transition to briefing
        await this.delay(1000);
        StateMachine.transition('briefing');
    },
    
    // Show mission briefing in terminal style
    async showBriefing() {
        const briefingScreen = document.getElementById('briefing-screen');
        const asciiHeader = document.getElementById('ascii-header');
        const briefingLines = document.getElementById('briefing-lines');
        const terminalProgress = document.getElementById('terminal-progress');
        
        // Clear any existing content
        asciiHeader.textContent = '';
        briefingLines.innerHTML = '';
        terminalProgress.innerHTML = '';
        
        // Add ASCII art header with typing effect
        const asciiArt = `
╔═══════════════════════════════════════════════════╗
║                CLASSIFIED BRIEFING                ║
║           OPERATION: BREWSTER'S MODO              ║
║             CODE NAME: GOBLIN SURPRISE            ║
╚═══════════════════════════════════════════════════╝`;
        
        await this.typeText(asciiHeader, asciiArt, 30, false);
        await this.delay(800);
        
        // Terminal divider
        const divider = document.createElement('div');
        divider.className = 'terminal-divider';
        briefingLines.appendChild(divider);
        await this.typeText(divider, '═'.repeat(51), 25, false);
        await this.delay(400);
        
        // Terminal-style briefing content with enhanced formatting
        const briefingContent = [
            { text: 'MISSION OBJECTIVES:', type: 'header' },
            { text: '• Distribute 200 MTGO tickets via public contest', type: 'bullet' },
            { text: '• Maintain operational integrity and fairness', type: 'bullet' },
            { text: '• Execute with maximum public engagement', type: 'bullet' },
            { text: '', type: 'spacer' },
            { text: 'RESOURCES PROVIDED:', type: 'header' },
            { text: '• MTGO Account: goblinsurprise (200 tickets loaded)', type: 'bullet' },
            { text: '• Social Media Channel: X platform access', type: 'bullet' },
            { text: '• Full operational autonomy', type: 'bullet' },
            { text: '', type: 'spacer' },
            { text: 'MISSION REWARD:', type: 'header' },
            { text: '• 600 MTGO TICKETS upon successful completion', type: 'reward' },
            { text: '', type: 'spacer' },
            { text: 'TIME CONSTRAINT:', type: 'header' },
            { text: '• 14 DAYS FROM ACCEPTANCE', type: 'warning' },
            { text: '', type: 'spacer' },
            { text: '█'.repeat(51), type: 'divider' },
            { text: 'ACCESSING SECURE VAULT...', type: 'system' }
        ];
        
        // Show lines progressively with typing effect
        for (let i = 0; i < briefingContent.length; i++) {
            const item = briefingContent[i];
            const line = document.createElement('div');
            line.className = `briefing-line ${item.type}`;
            briefingLines.appendChild(line);
            
            if (item.type === 'spacer') {
                await this.delay(200);
                continue;
            }
            
            // Type each line with terminal cursor
            await this.typeText(line, item.text, 50, true, true);
            AudioEngine.play('terminalBeep');
            await this.delay(item.type === 'header' ? 300 : 150);
        }
        
        // Show progress bar with animation
        await this.delay(1000);
        await this.showTerminalProgress(terminalProgress);
        
        // Show credentials
        await this.delay(1500);
        await this.showTerminalCredentials();
        
        // Show countdown
        await this.delay(1000);
        this.showCountdown();
    },
    
    // Show terminal progress bar with animation
    async showTerminalProgress(terminalProgress) {
        const progressSteps = [
            { text: 'CREDENTIAL ACQUISITION: ', progress: 0 },
            { text: 'VERIFYING AGENT CLEARANCE: ', progress: 33 },
            { text: 'ACCESSING SECURE VAULT: ', progress: 66 },
            { text: 'VAULT ACCESS: GRANTED', progress: 100 }
        ];
        
        for (let i = 0; i < progressSteps.length; i++) {
            const step = progressSteps[i];
            terminalProgress.innerHTML = `
                <div class="progress-step">${step.text}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${step.progress}%"></div>
                </div>
                <div class="progress-percentage">${step.progress}% COMPLETE</div>
            `;
            
            AudioEngine.play('terminalBeep');
            await this.delay(800);
        }
        
        // Final success state
        await this.delay(500);
        terminalProgress.innerHTML = `
            <div class="progress-step success">VAULT ACCESS: GRANTED</div>
            <div class="progress-bar">
                <div class="progress-fill complete" style="width: 100%"></div>
            </div>
            <div class="progress-percentage success">READY FOR CREDENTIAL RETRIEVAL</div>
        `;
        AudioEngine.play('success');
    },

    // Show credentials in terminal style
    async showTerminalCredentials() {
        const briefingLines = document.getElementById('briefing-lines');
        
        // Add divider
        const divider = document.createElement('div');
        divider.className = 'briefing-line divider';
        briefingLines.appendChild(divider);
        await this.typeText(divider, '─'.repeat(51), 30, false);
        await this.delay(300);
        
        // Credentials header
        const credHeader = document.createElement('div');
        credHeader.className = 'briefing-line header';
        briefingLines.appendChild(credHeader);
        await this.typeText(credHeader, 'CREDENTIALS ACQUIRED:', 50, true, true);
        await this.delay(200);
        
        // Social media link
        const linkLine = document.createElement('div');
        linkLine.className = 'briefing-line credential';
        briefingLines.appendChild(linkLine);
        await this.typeText(linkLine, '• Social Media Channel: ACTIVE', 50, true, true);
        await this.delay(200);
        
        // URL display
        const urlLine = document.createElement('div');
        urlLine.className = 'briefing-line url';
        briefingLines.appendChild(urlLine);
        await this.typeText(urlLine, '  └─ https://x.com/goblinsurprise', 50, true, true);
        await this.delay(200);
        
        // Make URL clickable after typing
        urlLine.innerHTML = `  └─ <a href="https://x.com/goblinsurprise" target="_blank" style="color: var(--color-secondary); text-decoration: underline;">https://x.com/goblinsurprise</a>`;
        
        // Status line
        const statusLine = document.createElement('div');
        statusLine.className = 'briefing-line status';
        briefingLines.appendChild(statusLine);
        await this.typeText(statusLine, '• Account Status: OPERATIONAL', 50, true, true);
        await this.delay(200);
        
        // Placeholder note
        const noteLine = document.createElement('div');
        noteLine.className = 'briefing-line note';
        briefingLines.appendChild(noteLine);
        await this.typeText(noteLine, '• Mission Alert: WILL BE TRANSMITTED', 50, true, true);
        
        AudioEngine.play('success');
    },
    
    // Legacy briefing function for reference
    async oldShowBriefing() {
        const overlay = this.elements.overlays.briefing;
        const content = document.getElementById('briefing-content');
        
        // Briefing content
        const briefingHTML = `
            <div class="briefing-section">
                <h3>OPERATION: BREWSTER'S MODO</h3>
                <div class="briefing-detail">Code Name: GOBLIN SURPRISE</div>
            </div>
            
            <div class="briefing-section">
                <h4>MISSION OBJECTIVES:</h4>
                <ul>
                    <li>Distribute 200 MTGO tickets via public contest</li>
                    <li>Maintain operational integrity and fairness</li>
                    <li>Execute with maximum public engagement</li>
                </ul>
            </div>
            
            <div class="briefing-section">
                <h4>RESOURCES PROVIDED:</h4>
                <ul>
                    <li>MTGO Account: goblinsurprise (200 tickets loaded)</li>
                    <li>Social Media Channel: X platform access</li>
                    <li>Full operational autonomy</li>
                </ul>
            </div>
            
            <div class="briefing-section">
                <h4>MISSION REWARD:</h4>
                <div class="reward-amount">600 MTGO TICKETS</div>
                <div class="reward-condition">Upon successful completion</div>
            </div>
            
            <div class="briefing-section">
                <h4>TIME CONSTRAINT:</h4>
                <div class="time-limit">14 DAYS FROM ACCEPTANCE</div>
            </div>
            
            <div class="credentials-section" id="credentials-section">
                <div class="accessing-vault">ACCESSING SECURE VAULT...</div>
            </div>
        `;
        
        content.innerHTML = briefingHTML;
        overlay.classList.add('active');
        
        // Animate sections
        const sections = content.querySelectorAll('.briefing-section');
        for (let i = 0; i < sections.length; i++) {
            await this.delay(500);
            sections[i].classList.add('animate-reveal');
        }
        
        // Credential sequence
        await this.delay(1000);
        await this.showCredentials();
        
        // Show countdown
        await this.delay(1000);
        this.showCountdown();
    },
    
    // Show credentials sequence
    async showCredentials() {
        const credSection = document.getElementById('credentials-section');
        
        await this.delay(1000);
        credSection.innerHTML = `
            <div class="credentials-acquired">CREDENTIALS ACQUIRED</div>
            <div class="credential-link">
                <a href="https://x.com/goblinsurprise" target="_blank">https://x.com/goblinsurprise</a>
            </div>
            <div class="credential-note">[PLACEHOLDER: Social media message will be sent]</div>
        `;
        
        AudioEngine.play('success');
    },
    
    // Show countdown timer
    async showCountdown() {
        const countdownSection = document.getElementById('countdown-section');
        countdownSection.classList.remove('hidden');
        countdownSection.classList.add('animate-reveal');
        
        // Initialize timer values
        this.updateTimer();
        
        // Dramatic reveal sequence
        await this.delay(2000);
        await this.dramaticTimerReveal();
    },
    
    // ASCII flip-clock reveal with dramatic sequence
    async dramaticTimerReveal() {
        const flipClock = document.getElementById('ascii-flip-clock');
        const message = document.getElementById('countdown-message');
        const countdownSection = document.getElementById('countdown-section');
        
        // Show countdown section
        countdownSection.classList.remove('hidden');
        
        // Hide message initially
        message.style.opacity = '0';
        message.style.transform = 'translateY(20px)';
        
        // Hide flip clock initially
        flipClock.style.opacity = '0';
        flipClock.style.transform = 'scale(0.5) translateY(50px)';
        
        await this.delay(500);
        
        // Dramatic clock reveal
        flipClock.style.transition = 'all 1.5s ease-out';
        flipClock.style.opacity = '1';
        flipClock.style.transform = 'scale(1) translateY(0px)';
        
        // Sound effect for reveal with screen flicker
        AudioEngine.play('success');
        this.addScreenFlicker(1000);
        
        await this.delay(800);
        
        // Reveal individual digits with staggered animation
        const digitGroups = flipClock.querySelectorAll('.flip-digit-group');
        for (let i = 0; i < digitGroups.length; i++) {
            const group = digitGroups[i];
            const digits = group.querySelectorAll('.flip-digit');
            
            // Animate each digit in the group
            digits.forEach((digit, digitIndex) => {
                setTimeout(() => {
                    digit.style.animation = 'flipDigitReveal 0.8s ease-out forwards';
                    AudioEngine.play('flipClock');
                }, digitIndex * 100);
            });
            
            await this.delay(300);
        }
        
        await this.delay(1000);
        
        // Show countdown message with clean animation
        message.style.transition = 'all 1s ease-out';
        message.style.opacity = '1';
        message.style.transform = 'translateY(0px)';
        
        // Enhanced visual effect for the message
        message.style.animation = 'pulse 2s infinite';
        
        // Play theme and start timer
        AudioEngine.playThemeWithSync(() => {
            // This callback fires when the music "drops"
            this.startASCIITimer();
            
            // Add glow effect to entire clock
            flipClock.classList.add('active-timer');
        });
    },
    
    // Update timer display
    updateTimer() {
        // For now, static display showing 14 days
        // Update the actual flip clock digits
        const daysTens = document.querySelector('#days-tens .ascii-digit');
        const daysOnes = document.querySelector('#days-ones .ascii-digit');
        const hoursTens = document.querySelector('#hours-tens .ascii-digit');
        const hoursOnes = document.querySelector('#hours-ones .ascii-digit');
        const minutesTens = document.querySelector('#minutes-tens .ascii-digit');
        const minutesOnes = document.querySelector('#minutes-ones .ascii-digit');
        const secondsTens = document.querySelector('#seconds-tens .ascii-digit');
        const secondsOnes = document.querySelector('#seconds-ones .ascii-digit');
        
        if (daysTens) daysTens.textContent = '║ 1 ║';
        if (daysOnes) daysOnes.textContent = '║ 4 ║';
        if (hoursTens) hoursTens.textContent = '║ 0 ║';
        if (hoursOnes) hoursOnes.textContent = '║ 0 ║';
        if (minutesTens) minutesTens.textContent = '║ 0 ║';
        if (minutesOnes) minutesOnes.textContent = '║ 0 ║';
        if (secondsTens) secondsTens.textContent = '║ 0 ║';
        if (secondsOnes) secondsOnes.textContent = '║ 0 ║';
    },
    
    // Start ASCII timer with flip animations
    startASCIITimer() {
        console.log('⏱️ ASCII Timer started!');
        
        // Set initial time (14:00:00:00)
        this.updateASCIIDigit('days-tens', '1');
        this.updateASCIIDigit('days-ones', '4');
        this.updateASCIIDigit('hours-tens', '0');
        this.updateASCIIDigit('hours-ones', '0');
        this.updateASCIIDigit('minutes-tens', '0');
        this.updateASCIIDigit('minutes-ones', '0');
        this.updateASCIIDigit('seconds-tens', '0');
        this.updateASCIIDigit('seconds-ones', '0');
        
        // Simulate countdown (for demo purposes)
        // In production, this would count down to actual deadline
        let seconds = 0;
        const countdownInterval = setInterval(() => {
            seconds++;
            
            // Update seconds display for visual effect
            const secOnes = seconds % 10;
            const secTens = Math.floor(seconds / 10) % 6;
            
            this.updateASCIIDigit('seconds-ones', secOnes.toString());
            if (seconds % 10 === 0) {
                this.updateASCIIDigit('seconds-tens', secTens.toString());
            }
            
            // After some time, transition to credits
            if (seconds >= 20) {
                clearInterval(countdownInterval);
                setTimeout(() => {
                    StateMachine.transition('credits');
                }, 2000);
            }
        }, 1000);
    },
    
    // Update individual ASCII digit with flip animation
    updateASCIIDigit(digitId, newValue) {
        const digit = document.getElementById(digitId);
        if (!digit) return;
        
        const frontPanel = digit.querySelector('.flip-panel.front');
        const backPanel = digit.querySelector('.flip-panel.back');
        const frontDigit = frontPanel.querySelector('.ascii-digit');
        const backDigit = backPanel.querySelector('.ascii-digit');
        
        // Set new value on back panel
        backDigit.textContent = `║ ${newValue} ║`;
        
        // Trigger flip animation
        digit.classList.add('flipping');
        
        // Play flip sound
        AudioEngine.play('beep');
        
        // Reset after animation
        setTimeout(() => {
            frontDigit.textContent = `║ ${newValue} ║`;
            digit.classList.remove('flipping');
        }, 600);
    },
    
    // Run credits sequence
    async runCreditsSequence() {
        // Mission stats
        const stats = [
            { label: 'Agents Activated', value: '1,337' },
            { label: 'Tickets Distributed', value: '200' },
            { label: 'Mission Success Rate', value: '100%' },
            { label: 'Goblins Surprised', value: '∞' }
        ];
        
        const statsSection = document.getElementById('mission-stats');
        statsSection.innerHTML = '<h2>MISSION STATISTICS</h2>';
        
        for (const stat of stats) {
            const statDiv = document.createElement('div');
            statDiv.className = 'stat-item animate-reveal';
            statDiv.innerHTML = `
                <span class="stat-label">${stat.label}:</span>
                <span class="stat-value">${stat.value}</span>
            `;
            statsSection.appendChild(statDiv);
            await this.delay(500);
        }
        
        // Credits scroll
        await this.delay(2000);
        this.startCreditsScroll();
    },
    
    // Start credits scroll
    startCreditsScroll() {
        const credits = [
            { name: 'BREWSTER', title: 'Mission Commander', card: 'Goblin Warchief' },
            { name: 'Agent ' + this.appState.agentName, title: 'Field Operative', card: 'Goblin Guide' },
            { name: 'CONTRIBUTOR_1', title: 'Logistics Specialist', card: 'Goblin Lackey' },
            { name: 'CONTRIBUTOR_2', title: 'Intelligence Analyst', card: 'Goblin Matron' },
            // Add more contributors here
        ];
        
        const creditsScroll = document.getElementById('credits-scroll');
        creditsScroll.innerHTML = '<h2>MISSION CREDITS</h2>';
        
        credits.forEach(credit => {
            const creditDiv = document.createElement('div');
            creditDiv.className = 'credit-entry';
            creditDiv.innerHTML = `
                <div class="credit-name">${credit.name}</div>
                <div class="credit-title">${credit.title}</div>
                <div class="credit-card">Donated: ${credit.card}</div>
            `;
            creditsScroll.appendChild(creditDiv);
        });
        
        creditsScroll.classList.add('animate-credits-scroll');
    },
    
    // Add phosphor glow to terminal elements
    addPhosphorGlow() {
        const glowElements = [
            '.system-status',
            '.stat-label',
            '.stat-value',
            '.header-text',
            '.terminal-content',
            '.cta-text'
        ];
        
        glowElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => el.classList.add('phosphor-glow'));
        });
    },
    
    // Establish connection sequence with enhanced audio
    async establishConnections() {
        const connectionDots = document.querySelector('.connection-dots');
        if (connectionDots) {
            // Simulate connection establishment with sound effects
            const phases = ['●○○', '●●○', '●●●'];
            
            // Play connection establishment sequence
            AudioEngine.playConnectionSequence();
            
            for (let i = 0; i < phases.length; i++) {
                connectionDots.textContent = phases[i];
                
                // Play system status change sound for each phase
                if (i < phases.length - 1) {
                    AudioEngine.play('systemStatusChange');
                } else {
                    // Final connection established
                    AudioEngine.playSystemStatusChange('success');
                }
                
                await this.delay(500);
            }
            
            connectionDots.classList.add('animate-connection-pulse');
        }
    },
    
    // Activate data connections with enhanced audio
    activateDataConnections() {
        const dataConnections = document.querySelectorAll('.data-connection');
        dataConnections.forEach((connection, index) => {
            setTimeout(() => {
                connection.style.opacity = '1';
                connection.style.animation = 'connectionEstablish 2s ease-out forwards';
                
                // Play connection establishment sound
                AudioEngine.play('connectionEstablish');
                
                // Start data flow after connection is established
                setTimeout(() => {
                    const dataFlow = connection.querySelector('.data-flow');
                    if (dataFlow) {
                        dataFlow.style.animation = 'dataFlow 2s infinite';
                        // Play data transfer sound
                        AudioEngine.playDataTransfer(4000); // 4 second transfer
                    }
                }, 2000);
            }, index * 300);
        });
    },
    
    // Show call to action
    showCallToAction() {
        const callToAction = document.getElementById('call-to-action');
        if (callToAction) {
            callToAction.classList.add('show');
            
            // Play subtle beep sound
            AudioEngine.play('beep');
        }
    },
    
    // Add screen flicker effect
    addScreenFlicker(duration = 2000) {
        document.body.classList.add('scan-interference');
        AudioEngine.playScreenFlicker(3);
        
        setTimeout(() => {
            document.body.classList.remove('scan-interference');
        }, duration);
    },
    
    // Mission declined sequence
    async runMissionDeclinedSequence() {
        const screen = document.getElementById('mission-declined-screen');
        const messageLines = screen.querySelectorAll('.declined-message .message-line');
        
        // Reveal messages sequentially
        messageLines.forEach((line, index) => {
            setTimeout(() => {
                line.style.opacity = '1';
                line.style.animation = 'fadeInSequence 0.5s ease-out forwards';
                AudioEngine.play('beep');
            }, index * 400);
        });
        
        // Start signal degradation after messages appear
        await this.delay(2000);
        await this.signalDegradation();
        
        // Auto-transition to payout processing
        await this.delay(2000);
        StateMachine.transition('payout-processing');
    },
    
    // Signal degradation animation
    async signalDegradation() {
        const signalBars = document.querySelectorAll('.signal-bars .bar');
        
        // Degrade signal bars one by one
        for (let i = signalBars.length - 1; i >= 0; i--) {
            await this.delay(300);
            signalBars[i].classList.remove('active');
            signalBars[i].classList.add('inactive');
            AudioEngine.play('disconnect');
        }
        
        // Update signal text
        await this.delay(500);
        const signalText = document.querySelector('.signal-text');
        if (signalText) {
            signalText.textContent = 'SIGNAL LOST - CONNECTION TERMINATED';
            signalText.style.color = 'var(--color-danger)';
        }
    },
    
    // Payout processing sequence
    async runPayoutProcessingSequence() {
        const agentNameElement = document.getElementById('payout-agent-name');
        const progressBar = document.getElementById('payout-progress');
        const progressText = document.getElementById('payout-progress-text');
        const processingStatus = document.querySelector('.processing-status');
        
        // Set agent name
        if (agentNameElement && this.appState.agentName) {
            agentNameElement.textContent = this.appState.agentName;
        }
        
        // Simulate payout processing
        await this.delay(1000);
        
        // Progress bar animation
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
                
                // Complete the payout
                setTimeout(() => {
                    processingStatus.textContent = 'COMPLETE';
                    processingStatus.style.color = 'var(--color-primary)';
                    AudioEngine.play('success');
                    
                    // Transition to credits after completion
                    setTimeout(() => {
                        StateMachine.transition('credits');
                    }, 2000);
                }, 500);
            }
            
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${Math.floor(progress)}%`;
        }, 200);
    },
    
    // Clearance verification sequence
    async runClearanceVerificationSequence() {
        const steps = document.querySelectorAll('.step-item');
        
        // Process each step sequentially
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const indicator = step.querySelector('.step-indicator');
            const status = step.querySelector('.step-status');
            
            // Activate step
            step.classList.add('active');
            status.textContent = 'PROCESSING';
            status.className = 'step-status processing';
            
            // Processing delay
            await this.delay(1000 + Math.random() * 1000);
            
            // Complete step
            indicator.textContent = '●';
            indicator.style.color = 'var(--color-primary)';
            status.textContent = 'VERIFIED';
            status.className = 'step-status verified';
            
            AudioEngine.play('beep');
            await this.delay(500);
        }
        
        // All steps complete, transition to downloading briefing
        await this.delay(1000);
        StateMachine.transition('downloading-briefing');
    },
    
    // Downloading briefing sequence
    async runDownloadingBriefingSequence() {
        const progressBar = document.getElementById('download-progress');
        const percentageText = document.getElementById('download-percentage');
        const speedText = document.getElementById('download-speed');
        const dataStream = document.getElementById('data-stream');
        
        // Start data stream animation
        const streamLines = dataStream.querySelectorAll('.stream-line');
        streamLines.forEach((line, index) => {
            line.style.animationDelay = `${index * 0.5}s`;
            line.style.animation = 'dataFlow 3s ease-in-out infinite';
        });
        
        // Simulate download progress
        let progress = 0;
        let speed = 0;
        
        const downloadInterval = setInterval(() => {
            // Vary speed realistically
            speed = 800 + Math.random() * 400;
            progress += (speed / 27000) * 100; // Realistic download speed calculation
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(downloadInterval);
                
                // Download complete
                setTimeout(() => {
                    speedText.textContent = 'DOWNLOAD COMPLETE';
                    AudioEngine.play('success');
                    
                    // Transition to briefing
                    setTimeout(() => {
                        StateMachine.transition('briefing');
                    }, 2000);
                }, 500);
            }
            
            progressBar.style.width = `${progress}%`;
            percentageText.textContent = `${Math.floor(progress)}%`;
            speedText.textContent = `${Math.floor(speed)} KB/s`;
        }, 100);
    },
    
    // Start cascading signal wave animation
    startSignalWave(signalBars) {
        console.log('🌊 Starting signal wave animation with', signalBars.length, 'bars');
        console.log('📱 Device info: Mobile:', window.innerWidth <= 768, 'Width:', window.innerWidth);
        console.log('🎛️ Reduced motion:', window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        
        let currentBar = 0;
        
        this.signalWaveInterval = setInterval(() => {
            // Remove bouncing from all bars
            signalBars.forEach((bar, index) => {
                if (bar.classList.contains('bouncing')) {
                    console.log(`🔄 Removing bouncing from bar ${index}`);
                }
                bar.classList.remove('bouncing');
            });
            
            // Add bouncing to current bar
            console.log(`⬆️ Adding bouncing to bar ${currentBar}`);
            signalBars[currentBar].classList.add('bouncing');
            
            // Enhanced visual confirmation
            const bouncingBar = signalBars[currentBar];
            console.log(`🎯 Bar ${currentBar} classes:`, bouncingBar.classList.toString());
            console.log(`📏 Bar ${currentBar} computed style:`, {
                width: getComputedStyle(bouncingBar).width,
                height: getComputedStyle(bouncingBar).height,
                animation: getComputedStyle(bouncingBar).animation,
                transform: getComputedStyle(bouncingBar).transform
            });
            
            // Move to next bar (cascade left to right, then loop)
            currentBar = (currentBar + 1) % signalBars.length;
        }, 250); // 250ms interval for faster, more dynamic cascading effect
    },
    
    // Stop signal wave animation
    stopSignalWave(signalBars) {
        console.log('🛑 Stopping signal wave animation');
        if (this.signalWaveInterval) {
            clearInterval(this.signalWaveInterval);
            this.signalWaveInterval = null;
        }
        
        // Remove bouncing from all bars
        signalBars.forEach((bar, index) => {
            if (bar.classList.contains('bouncing')) {
                console.log(`🔄 Final cleanup: removing bouncing from bar ${index}`);
            }
            bar.classList.remove('bouncing');
        });
        console.log('✅ Signal wave animation stopped and cleaned up');
    },
    
    // Enhanced mobile-compatible smooth scroll with comprehensive debugging
    smoothScrollToElement(element) {
        if (!element) {
            console.log('📱 SCROLL DEBUG: Element not found, skipping scroll');
            return Promise.resolve();
        }
        
        // Mobile detection and debugging
        const isMobile = window.innerWidth <= 768;
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const userAgent = navigator.userAgent;
        const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
        const isAndroid = /Android/.test(userAgent);
        
        console.log('📱 SCROLL DEBUG: Device info:', {
            isMobile,
            isTouch,
            isIOS,
            isAndroid,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight
        });
        
        // Get element position data
        const elementRect = element.getBoundingClientRect();
        const elementTop = elementRect.top + window.pageYOffset;
        const currentScrollY = window.pageYOffset;
        
        // Get document height to prevent over-scrolling
        const documentHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );
        const viewportHeight = window.innerHeight;
        const maxScrollY = Math.max(0, documentHeight - viewportHeight);
        
        // Mobile-optimized offset calculation
        // Special handling for final prompt to prevent over-scrolling
        const isFinalPrompt = element.id === 'final-prompt';
        const baseOffset = isMobile ? 
            (isFinalPrompt ? window.innerHeight * 0.05 : window.innerHeight * 0.15) : 
            window.innerHeight * 0.1;
        const mobileAddressBarOffset = isIOS ? 60 : (isAndroid ? 40 : 0);
        const totalOffset = baseOffset + mobileAddressBarOffset;
        
        // Calculate target position with boundary limits
        const desiredPosition = elementTop - totalOffset;
        const targetPosition = Math.min(Math.max(0, desiredPosition), maxScrollY);
        
        console.log('📱 SCROLL DEBUG: Position calculations:', {
            elementTop,
            currentScrollY,
            targetPosition,
            baseOffset,
            mobileAddressBarOffset,
            totalOffset,
            scrollDistance: targetPosition - currentScrollY,
            documentHeight,
            viewportHeight,
            maxScrollY,
            withinBounds: targetPosition <= maxScrollY
        });
        
        // Test if scrolling is actually needed
        const scrollThreshold = 50; // Only scroll if more than 50px difference
        if (Math.abs(targetPosition - currentScrollY) < scrollThreshold) {
            console.log('📱 SCROLL DEBUG: Element already in view, skipping scroll');
            return Promise.resolve();
        }
        
        // Multi-method scroll approach for mobile compatibility
        return new Promise(resolve => {
            const startTime = Date.now();
            const initialScrollY = window.pageYOffset;
            
            // Method 1: Standard window.scrollTo with smooth behavior
            try {
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                console.log('📱 SCROLL DEBUG: window.scrollTo() attempted');
            } catch (e) {
                console.log('📱 SCROLL DEBUG: window.scrollTo() failed:', e.message);
            }
            
            // Method 2: Fallback using element.scrollIntoView (mobile-friendly)
            // Only use as fallback if window.scrollTo didn't work
            if (isIOS || !('scrollBehavior' in document.documentElement.style)) {
                setTimeout(() => {
                    try {
                        element.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                            inline: 'nearest'
                        });
                        console.log('📱 SCROLL DEBUG: scrollIntoView() attempted as fallback');
                    } catch (e) {
                        console.log('📱 SCROLL DEBUG: scrollIntoView() failed:', e.message);
                    }
                }, 100);
            }
            
            // Method 3: Manual scroll animation - DISABLED for iOS to prevent jankiness
            if (isMobile && isAndroid && !isIOS) {
                // Only use manual scroll for Android if native methods fail
                setTimeout(() => {
                    this.manualSmoothScroll(targetPosition, 800);
                    console.log('📱 SCROLL DEBUG: Manual scroll animation started (Android only)');
                }, 200);
            } else if (isIOS) {
                console.log('📱 SCROLL DEBUG: Manual scroll disabled on iOS for smooth experience');
            }
            
            // Monitor scroll completion
            const checkScrollComplete = () => {
                const currentY = window.pageYOffset;
                const elapsed = Date.now() - startTime;
                
                console.log('📱 SCROLL DEBUG: Scroll progress:', {
                    currentY,
                    targetPosition,
                    elapsed,
                    scrollComplete: Math.abs(currentY - targetPosition) < 10
                });
                
                if (Math.abs(currentY - targetPosition) < 10 || elapsed > 2000) {
                    console.log('📱 SCROLL DEBUG: Scroll completed or timed out');
                    resolve();
                } else if (elapsed < 1500) {
                    setTimeout(checkScrollComplete, 100);
                } else {
                    console.log('📱 SCROLL DEBUG: Scroll timeout, resolving anyway');
                    resolve();
                }
            };
            
            setTimeout(checkScrollComplete, 100);
        });
    },
    
    // Manual smooth scroll implementation for mobile compatibility
    manualSmoothScroll(targetY, duration = 800) {
        const startY = window.pageYOffset;
        const distance = targetY - startY;
        const startTime = Date.now();
        
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
        
        const animateScroll = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = easeOutCubic(progress);
            
            const currentY = startY + (distance * easeProgress);
            window.scrollTo(0, currentY);
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };
        
        requestAnimationFrame(animateScroll);
    },
    
    // Intersection Observer-based scroll solution for mobile
    initializeScrollObserver() {
        if (this.scrollObserver) {
            this.scrollObserver.disconnect();
        }
        
        const isMobile = window.innerWidth <= 768;
        
        // Enhanced mobile threshold for better visibility
        const threshold = isMobile ? 0.3 : 0.5;
        const rootMargin = isMobile ? '-10% 0px -60% 0px' : '-20% 0px -60% 0px';
        
        this.scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const element = entry.target;
                const isVisible = entry.isIntersecting;
                
                console.log('📱 INTERSECTION OBSERVER:', {
                    elementId: element.id,
                    isVisible,
                    intersectionRatio: entry.intersectionRatio,
                    boundingClientRect: entry.boundingClientRect,
                    rootBounds: entry.rootBounds
                });
                
                if (!isVisible && entry.boundingClientRect.top < entry.rootBounds.top) {
                    // Element is above viewport, scroll to bring it into view
                    console.log('📱 INTERSECTION OBSERVER: Element above viewport, scrolling to show');
                    this.smoothScrollToElement(element);
                }
            });
        }, {
            threshold,
            rootMargin
        });
        
        console.log('📱 Intersection Observer initialized with threshold:', threshold, 'rootMargin:', rootMargin);
    },
    
    // Enhanced scroll-to-element with Intersection Observer integration
    observeElementForScroll(element) {
        if (!element) return;
        
        if (!this.scrollObserver) {
            this.initializeScrollObserver();
        }
        
        this.scrollObserver.observe(element);
        console.log('📱 Now observing element for scroll:', element.id);
    },
    
    // Unobserve element when no longer needed
    unobserveElementForScroll(element) {
        if (!element || !this.scrollObserver) return;
        
        this.scrollObserver.unobserve(element);
        console.log('📱 Stopped observing element for scroll:', element.id);
    },
    
    // Check for reduced motion preference and adapt scrolling behavior
    shouldUseReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        console.log('📱 ACCESSIBILITY: Prefers reduced motion:', prefersReducedMotion);
        return prefersReducedMotion;
    },
    
    // Accessible scroll implementation with reduced motion support
    accessibleScrollToElement(element) {
        if (!element) return Promise.resolve();
        
        const reducedMotion = this.shouldUseReducedMotion();
        
        if (reducedMotion) {
            // Instant scroll for reduced motion preference
            console.log('📱 ACCESSIBILITY: Using instant scroll for reduced motion');
            element.scrollIntoView({ behavior: 'auto', block: 'start' });
            return Promise.resolve();
        } else {
            // Use enhanced smooth scroll for full motion experience
            return this.smoothScrollToElement(element);
        }
    },
    
    // Utility delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // Smart button sizing utility - ensures buttons accommodate their content
    optimizeButtonSizing() {
        console.log('🔧 Optimizing mission button sizing...');
        
        const missionButtons = document.querySelectorAll('.mission-button');
        
        missionButtons.forEach((button, index) => {
            const buttonText = button.querySelector('.button-text');
            if (!buttonText) return;
            
            // Get computed styles for accurate measurement
            const buttonStyles = window.getComputedStyle(button);
            const textStyles = window.getComputedStyle(buttonText);
            
            const buttonWidth = parseFloat(buttonStyles.width);
            const fontSize = parseFloat(textStyles.fontSize);
            const lineHeight = parseFloat(textStyles.lineHeight) || fontSize * 1.4;
            const padding = parseFloat(buttonStyles.paddingTop) + parseFloat(buttonStyles.paddingBottom);
            
            // Estimate text dimensions
            const textContent = buttonText.textContent;
            const avgCharWidth = fontSize * 0.6; // Approximate character width
            const textWidth = textContent.length * avgCharWidth;
            const linesNeeded = Math.ceil(textWidth / (buttonWidth - 40)); // Account for horizontal padding
            
            const requiredHeight = (linesNeeded * lineHeight) + padding + 20; // Extra margin for safety
            const currentMinHeight = parseFloat(buttonStyles.minHeight);
            
            console.log(`   Button ${index}: "${textContent}" requires ${linesNeeded} lines, ${requiredHeight}px height (current min: ${currentMinHeight}px)`);
            
            // Only adjust if our calculation suggests more height is needed
            if (requiredHeight > currentMinHeight) {
                button.style.minHeight = `${Math.ceil(requiredHeight)}px`;
                console.log(`   ✅ Adjusted button ${index} min-height to ${Math.ceil(requiredHeight)}px`);
            }
        });
        
        console.log('✅ Button sizing optimization complete');
    }
};