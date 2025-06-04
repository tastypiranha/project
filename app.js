// Multi-Agent Document Processing System
class DocumentProcessingSystem {
    constructor() {
        this.sampleData = {
            "sampleDocuments": {
                "email": {
                    "complaint": "From: angry.customer@email.com\nTo: support@company.com\nSubject: URGENT - Unacceptable Service\n\nI am extremely frustrated with the poor service I received. This is completely unacceptable and I demand immediate action. If this is not resolved by tomorrow, I will be forced to take this matter to legal counsel.\n\nI have been a loyal customer for 5 years and this treatment is outrageous.",
                    "rfq": "From: procurement@bigcorp.com\nTo: sales@vendor.com\nSubject: Request for Quote - Office Supplies\n\nDear Sales Team,\n\nWe would like to request a quote for the following office supplies:\n- 500 units of premium paper\n- 50 printer cartridges\n- 100 folders\n\nPlease provide your best pricing and delivery timeline.",
                    "routine": "From: info@newsletter.com\nTo: subscriber@email.com\nSubject: Weekly Newsletter\n\nThank you for subscribing to our weekly newsletter. Here are this week's highlights and updates from our team."
                },
                "json": {
                    "highValue": "{\"id\": \"TXN_12345\", \"timestamp\": \"2025-01-15T10:30:00Z\", \"type\": \"transaction\", \"amount\": 25000, \"user_id\": \"USR_789\", \"description\": \"Wire transfer\", \"risk_score\": 0.8}",
                    "normal": "{\"id\": \"TXN_67890\", \"timestamp\": \"2025-01-15T10:30:00Z\", \"type\": \"purchase\", \"amount\": 49.99, \"user_id\": \"USR_123\", \"description\": \"Online purchase\"}",
                    "suspicious": "{\"id\": \"TXN_99999\", \"timestamp\": \"2025-01-15T10:30:00Z\", \"type\": \"withdrawal\", \"amount\": 9999, \"user_id\": \"USR_UNKNOWN\", \"description\": \"ATM withdrawal\"}"
                },
                "pdf": {
                    "invoice": "INVOICE #INV-2025-001\nDate: January 15, 2025\nBill To: ABC Corporation\nAmount: $15,750.00\nTerms: Net 30\n\nDescription: Professional consulting services\nQuantity: 1\nRate: $15,750.00",
                    "compliance": "PRIVACY POLICY DOCUMENT\n\nThis document outlines our GDPR compliance procedures and HIPAA requirements for data protection. All personal data must be processed according to FDA regulations and SOX compliance standards.",
                    "contract": "SERVICE AGREEMENT\n\nThis agreement governs the provision of services between the parties. All terms are subject to applicable regulations and compliance requirements."
                },
                "text": {
                    "regulation": "This document contains important regulatory information regarding FDA approval processes and GDPR compliance requirements for data handling.",
                    "complaint": "I am writing to express my dissatisfaction with the recent service failure. This issue has caused significant inconvenience and I expect immediate resolution.",
                    "general": "This is a general business document containing standard information about our company policies and procedures."
                }
            }
        };

        this.memory = [];
        this.processedCount = 0;
        this.actionsCount = 0;
        this.isProcessing = false;
        
        this.initializeElements();
        this.attachEventListeners();
        this.resetPipeline();
    }

    initializeElements() {
        this.uploadZone = document.getElementById('uploadZone');
        this.fileInput = document.getElementById('fileInput');
        this.fileSelectBtn = document.getElementById('fileSelectBtn');
        this.classificationResults = document.getElementById('classificationResults');
        this.pipelineFlow = document.getElementById('pipelineFlow');
        this.processingIndicator = document.getElementById('processingIndicator');
        this.memoryContent = document.getElementById('memoryContent');
        this.actionsContent = document.getElementById('actionsContent');
        this.documentsProcessed = document.getElementById('documentsProcessed');
        this.actionsTriggered = document.getElementById('actionsTriggered');
        this.clearMemoryBtn = document.getElementById('clearMemory');
    }

    attachEventListeners() {
        // File upload handlers
        this.uploadZone.addEventListener('click', () => {
            if (!this.isProcessing) {
                this.fileInput.click();
            }
        });
        
        this.fileSelectBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!this.isProcessing) {
                this.fileInput.click();
            }
        });
        
        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files);
            }
        });

        // Drag and drop handlers
        this.uploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadZone.addEventListener('drop', (e) => this.handleDrop(e));

        // Sample document handlers
        document.querySelectorAll('[data-sample]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.isProcessing) {
                    this.loadSampleDocument(e.target.dataset.sample);
                }
            });
        });

        // Clear memory handler
        this.clearMemoryBtn.addEventListener('click', () => this.clearMemory());
    }

    handleDragOver(e) {
        e.preventDefault();
        if (!this.isProcessing) {
            this.uploadZone.classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadZone.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadZone.classList.remove('drag-over');
        if (!this.isProcessing && e.dataTransfer.files.length > 0) {
            this.handleFileUpload(e.dataTransfer.files);
        }
    }

    handleFileUpload(files) {
        if (files.length === 0 || this.isProcessing) return;
        
        const file = files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const content = e.target.result;
            const fileExtension = file.name.split('.').pop().toLowerCase();
            this.processDocument(content, fileExtension, file.name);
        };
        
        reader.onerror = () => {
            console.error('Error reading file');
            this.updateProcessingIndicator('Error');
            this.isProcessing = false;
        };
        
        reader.readAsText(file);
    }

    loadSampleDocument(sampleType) {
        if (this.isProcessing) return;
        
        const sampleMap = {
            'email-complaint': { content: this.sampleData.sampleDocuments.email.complaint, type: 'eml', name: 'complaint_email.eml' },
            'json-suspicious': { content: this.sampleData.sampleDocuments.json.suspicious, type: 'json', name: 'suspicious_transaction.json' },
            'pdf-invoice': { content: this.sampleData.sampleDocuments.pdf.invoice, type: 'pdf', name: 'invoice_document.pdf' },
            'text-regulation': { content: this.sampleData.sampleDocuments.text.regulation, type: 'txt', name: 'regulation_text.txt' }
        };

        const sample = sampleMap[sampleType];
        if (sample) {
            this.processDocument(sample.content, sample.type, sample.name);
        }
    }

    async processDocument(content, fileType, fileName) {
        if (this.isProcessing) return;
        
        try {
            this.isProcessing = true;
            this.resetPipeline();
            this.updateProcessingIndicator('Processing');

            console.log('Starting processing for:', fileName);

            // Step 1: File Upload
            this.updatePipelineStep('upload', 'active');
            await this.delay(800);
            this.updatePipelineStep('upload', 'completed');

            // Step 2: Classification
            this.updatePipelineStep('classify', 'active');
            this.updateAgentStatus('classifier', 'processing');
            
            const classification = this.classifyDocument(content, fileType);
            await this.delay(1200);
            
            this.displayClassificationResults(classification);
            this.updateAgentStatus('classifier', 'active');
            this.updatePipelineStep('classify', 'completed');

            // Step 3: Agent Routing
            this.updatePipelineStep('route', 'active');
            await this.delay(600);
            const targetAgent = this.determineTargetAgent(fileType);
            this.updatePipelineStep('route', 'completed');

            // Step 4: Specialized Processing
            this.updatePipelineStep('process', 'active');
            const processingResults = await this.processWithSpecializedAgent(targetAgent, content, classification);
            this.updatePipelineStep('process', 'completed');

            // Step 5: Action Execution
            this.updatePipelineStep('action', 'active');
            const actions = await this.executeActions(classification, processingResults);
            this.updatePipelineStep('action', 'completed');

            // Update memory store
            this.addToMemory(fileName, classification, processingResults, actions);
            this.updateProcessingIndicator('Completed');

            // Update statistics
            this.processedCount++;
            this.documentsProcessed.textContent = this.processedCount;
            
        } catch (error) {
            console.error('Error during processing:', error);
            this.updateProcessingIndicator('Error');
        } finally {
            this.isProcessing = false;
        }
    }

    classifyDocument(content, fileType) {
        // Format detection
        const formatConfidence = this.calculateFormatConfidence(content, fileType);
        
        // Intent classification
        const intent = this.classifyIntent(content);
        
        return {
            format: {
                detected: fileType.toUpperCase(),
                confidence: formatConfidence
            },
            intent: intent
        };
    }

    calculateFormatConfidence(content, fileType) {
        const indicators = {
            'eml': ['From:', 'To:', 'Subject:'],
            'json': ['{', '}', '":', 'timestamp'],
            'pdf': ['INVOICE', 'Date:', 'Amount:', '$'],
            'txt': content.length > 10
        };

        if (fileType === 'txt') return 0.95;
        
        const typeIndicators = indicators[fileType] || [];
        const matches = typeIndicators.filter(indicator => 
            content.toLowerCase().includes(indicator.toLowerCase())
        ).length;
        
        return Math.min(0.95, 0.6 + (matches * 0.1));
    }

    classifyIntent(content) {
        const intentKeywords = {
            'Complaint': { keywords: ['complaint', 'issue', 'problem', 'dissatisfied', 'frustrated', 'unacceptable', 'legal'], confidence: 0 },
            'RFQ': { keywords: ['request for quote', 'quotation', 'pricing', 'rfq', 'quote'], confidence: 0 },
            'Invoice': { keywords: ['invoice', 'billing', 'payment', 'amount due', 'bill to'], confidence: 0 },
            'Regulation': { keywords: ['compliance', 'regulation', 'gdpr', 'fda', 'hipaa', 'sox'], confidence: 0 },
            'Fraud Risk': { keywords: ['suspicious', 'fraud', 'unusual', 'high risk', 'unknown'], confidence: 0 }
        };

        const contentLower = content.toLowerCase();
        
        Object.keys(intentKeywords).forEach(intent => {
            const matches = intentKeywords[intent].keywords.filter(keyword => 
                contentLower.includes(keyword.toLowerCase())
            ).length;
            intentKeywords[intent].confidence = Math.min(0.95, matches * 0.15 + 0.2);
        });

        const topIntent = Object.keys(intentKeywords).reduce((a, b) => 
            intentKeywords[a].confidence > intentKeywords[b].confidence ? a : b
        );

        return {
            type: topIntent,
            confidence: Math.max(0.3, intentKeywords[topIntent].confidence)
        };
    }

    displayClassificationResults(classification) {
        const html = `
            <div class="format-result fade-in">
                <h4>Format Detection</h4>
                <div class="confidence-meter">
                    <div class="confidence-label">
                        <span>${classification.format.detected}</span>
                        <span>${Math.round(classification.format.confidence * 100)}%</span>
                    </div>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${classification.format.confidence * 100}%"></div>
                    </div>
                </div>
            </div>
            <div class="intent-result fade-in">
                <h4>Business Intent</h4>
                <div class="confidence-meter">
                    <div class="confidence-label">
                        <span>${classification.intent.type}</span>
                        <span>${Math.round(classification.intent.confidence * 100)}%</span>
                    </div>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${classification.intent.confidence * 100}%"></div>
                    </div>
                </div>
            </div>
        `;
        this.classificationResults.innerHTML = html;
    }

    determineTargetAgent(fileType) {
        const agentMap = {
            'eml': 'email',
            'json': 'json',
            'pdf': 'pdf',
            'txt': 'text'
        };
        return agentMap[fileType] || 'text';
    }

    async processWithSpecializedAgent(agentType, content, classification) {
        this.updateAgentStatus(agentType, 'processing');
        
        let results = {};
        
        try {
            switch (agentType) {
                case 'email':
                    results = this.processEmail(content);
                    break;
                case 'json':
                    results = this.processJSON(content);
                    break;
                case 'pdf':
                    results = this.processPDF(content);
                    break;
                case 'text':
                    results = this.processText(content);
                    break;
                default:
                    results = { error: 'Unknown agent type' };
            }

            await this.delay(1500);
            this.displayAgentResults(agentType, results);
            this.updateAgentStatus(agentType, 'active');
            
        } catch (error) {
            console.error(`Error in ${agentType} agent:`, error);
            results = { error: 'Processing failed' };
            this.updateAgentStatus(agentType, 'idle');
        }
        
        return results;
    }

    processEmail(content) {
        const lines = content.split('\n');
        const fromMatch = lines.find(line => line.startsWith('From:'));
        const toMatch = lines.find(line => line.startsWith('To:'));
        const subjectMatch = lines.find(line => line.startsWith('Subject:'));
        
        const urgencyKeywords = ['urgent', 'immediate', 'asap', 'emergency'];
        const toneKeywords = {
            threatening: ['legal', 'lawsuit', 'attorney', 'court'],
            escalating: ['manager', 'supervisor', 'escalate'],
            polite: ['please', 'thank you', 'appreciate'],
            angry: ['frustrated', 'unacceptable', 'outrageous']
        };

        const urgency = urgencyKeywords.some(keyword => 
            content.toLowerCase().includes(keyword)
        ) ? 'critical' : 'normal';

        let tone = 'neutral';
        for (const [toneType, keywords] of Object.entries(toneKeywords)) {
            if (keywords.some(keyword => content.toLowerCase().includes(keyword))) {
                tone = toneType;
                break;
            }
        }

        return {
            sender: fromMatch ? fromMatch.replace('From:', '').trim() : 'Unknown',
            recipient: toMatch ? toMatch.replace('To:', '').trim() : 'Unknown',
            subject: subjectMatch ? subjectMatch.replace('Subject:', '').trim() : 'No Subject',
            urgency: urgency,
            tone: tone
        };
    }

    processJSON(content) {
        try {
            const data = JSON.parse(content);
            const riskFactors = [];
            
            if (data.amount && data.amount > 10000) {
                riskFactors.push('High value transaction');
            }
            
            if (data.user_id && data.user_id.includes('UNKNOWN')) {
                riskFactors.push('Unknown user');
            }
            
            if (data.risk_score && data.risk_score > 0.7) {
                riskFactors.push('High risk score');
            }

            const riskLevel = riskFactors.length > 1 ? 'high' : 
                            riskFactors.length === 1 ? 'medium' : 'low';

            return {
                schema: 'Valid JSON structure',
                fields: Object.keys(data).join(', '),
                riskLevel: riskLevel,
                riskFactors: riskFactors,
                amount: data.amount || 'N/A'
            };
        } catch (e) {
            return {
                schema: 'Invalid JSON',
                error: e.message,
                riskLevel: 'low',
                riskFactors: []
            };
        }
    }

    processPDF(content) {
        const complianceKeywords = ['GDPR', 'FDA', 'HIPAA', 'SOX', 'compliance', 'regulation'];
        const invoiceKeywords = ['invoice', 'amount', 'bill to', 'terms', 'payment'];
        
        const foundCompliance = complianceKeywords.filter(keyword => 
            content.toLowerCase().includes(keyword.toLowerCase())
        );
        
        const foundInvoice = invoiceKeywords.filter(keyword => 
            content.toLowerCase().includes(keyword.toLowerCase())
        );

        const amountMatch = content.match(/\$[\d,]+\.?\d*/);
        
        return {
            textExtracted: `${content.substring(0, 100)}...`,
            complianceKeywords: foundCompliance,
            invoiceDetected: foundInvoice.length > 2,
            amount: amountMatch ? amountMatch[0] : 'Not detected',
            flags: foundCompliance.length > 0 ? ['Compliance document detected'] : []
        };
    }

    processText(content) {
        const keywords = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
        const uniqueKeywords = [...new Set(keywords)].slice(0, 10);
        
        const sentimentKeywords = {
            positive: ['good', 'excellent', 'satisfied', 'happy'],
            negative: ['bad', 'poor', 'dissatisfied', 'problem'],
            neutral: ['standard', 'normal', 'regular', 'typical']
        };

        let sentiment = 'neutral';
        for (const [sentType, words] of Object.entries(sentimentKeywords)) {
            if (words.some(word => content.toLowerCase().includes(word))) {
                sentiment = sentType;
                break;
            }
        }

        return {
            wordCount: content.split(/\s+/).length,
            keyWords: uniqueKeywords,
            sentiment: sentiment,
            topics: this.extractTopics(content)
        };
    }

    extractTopics(content) {
        const topicKeywords = {
            'Business': ['business', 'company', 'corporate', 'enterprise'],
            'Technology': ['technology', 'software', 'system', 'digital'],
            'Legal': ['legal', 'law', 'regulation', 'compliance'],
            'Finance': ['finance', 'payment', 'money', 'invoice']
        };

        const detectedTopics = [];
        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            if (keywords.some(keyword => content.toLowerCase().includes(keyword))) {
                detectedTopics.push(topic);
            }
        }

        return detectedTopics.length > 0 ? detectedTopics : ['General'];
    }

    displayAgentResults(agentType, results) {
        const resultsDiv = document.getElementById(`${agentType}Results`);
        if (!resultsDiv) return;
        
        let html = '';

        if (results.error) {
            html = `<div class="result-item"><strong>Error:</strong> ${results.error}</div>`;
        } else {
            switch (agentType) {
                case 'email':
                    html = `
                        <div class="result-item"><strong>Sender:</strong> ${results.sender}</div>
                        <div class="result-item"><strong>Subject:</strong> ${results.subject}</div>
                        <div class="result-item"><strong>Urgency:</strong> ${results.urgency}</div>
                        <div class="result-item"><strong>Tone:</strong> ${results.tone}</div>
                    `;
                    break;
                case 'json':
                    html = `
                        <div class="result-item"><strong>Schema:</strong> ${results.schema}</div>
                        <div class="result-item"><strong>Risk Level:</strong> ${results.riskLevel}</div>
                        <div class="result-item"><strong>Amount:</strong> ${results.amount}</div>
                        ${results.riskFactors && results.riskFactors.length > 0 ? `<div class="result-item"><strong>Risk Factors:</strong> ${results.riskFactors.join(', ')}</div>` : ''}
                    `;
                    break;
                case 'pdf':
                    html = `
                        <div class="result-item"><strong>Text Extracted:</strong> ${results.textExtracted}</div>
                        <div class="result-item"><strong>Invoice:</strong> ${results.invoiceDetected ? 'Yes' : 'No'}</div>
                        <div class="result-item"><strong>Compliance Keywords:</strong> ${results.complianceKeywords.join(', ') || 'None'}</div>
                        <div class="result-item"><strong>Amount:</strong> ${results.amount}</div>
                    `;
                    break;
                case 'text':
                    html = `
                        <div class="result-item"><strong>Word Count:</strong> ${results.wordCount}</div>
                        <div class="result-item"><strong>Sentiment:</strong> ${results.sentiment}</div>
                        <div class="result-item"><strong>Topics:</strong> ${results.topics.join(', ')}</div>
                        <div class="result-item"><strong>Key Words:</strong> ${results.keyWords.slice(0, 5).join(', ')}</div>
                    `;
                    break;
            }
        }

        resultsDiv.innerHTML = html;
    }

    async executeActions(classification, processingResults) {
        const actions = this.determineActions(classification, processingResults);
        
        for (const action of actions) {
            await this.triggerAction(action);
        }

        this.actionsCount += actions.length;
        this.actionsTriggered.textContent = this.actionsCount;
        
        return actions;
    }

    determineActions(classification, processingResults) {
        const actions = [];
        
        // Determine actions based on classification and processing results
        if (classification.intent.type === 'Complaint' && processingResults.tone === 'threatening') {
            actions.push({
                type: 'escalation',
                target: 'CRM System',
                priority: 'immediate',
                reason: 'Threatening complaint detected'
            });
        }
        
        if (processingResults.riskLevel === 'high') {
            actions.push({
                type: 'risk_alert',
                target: 'Risk Management',
                priority: 'high',
                reason: 'High risk transaction detected'
            });
        }
        
        if (processingResults.complianceKeywords && processingResults.complianceKeywords.length > 0) {
            actions.push({
                type: 'compliance_flag',
                target: 'Compliance Team',
                priority: 'medium',
                reason: 'Regulatory keywords detected'
            });
        }
        
        if (classification.intent.type === 'RFQ') {
            actions.push({
                type: 'ticket_creation',
                target: 'Sales System',
                priority: 'normal',
                reason: 'RFQ processing required'
            });
        }

        // Default action if none triggered
        if (actions.length === 0) {
            actions.push({
                type: 'ticket_creation',
                target: 'Support System',
                priority: 'normal',
                reason: 'Routine document processing'
            });
        }

        return actions;
    }

    async triggerAction(action) {
        const actionElement = this.createActionElement(action);
        
        // Clear placeholder if it exists
        const placeholder = this.actionsContent.querySelector('.actions-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
        
        this.actionsContent.appendChild(actionElement);

        // Simulate action execution
        await this.delay(500);
        actionElement.classList.add('executing');
        const statusElement = actionElement.querySelector('.action-status');
        statusElement.textContent = 'Executing';
        statusElement.className = 'action-status executing';
        
        await this.delay(1000);
        actionElement.classList.remove('executing');
        actionElement.classList.add('completed');
        statusElement.textContent = 'Completed';
        statusElement.className = 'action-status completed';
    }

    createActionElement(action) {
        const actionDiv = document.createElement('div');
        actionDiv.className = 'action-item fade-in';
        actionDiv.innerHTML = `
            <div class="action-header">
                <div class="action-type">${action.type.replace('_', ' ').toUpperCase()}</div>
                <div class="action-priority ${action.priority}">${action.priority.toUpperCase()}</div>
            </div>
            <div class="action-details">
                <strong>Target:</strong> ${action.target}<br>
                <strong>Reason:</strong> ${action.reason}
            </div>
            <div class="action-status pending">Pending</div>
        `;
        return actionDiv;
    }

    addToMemory(fileName, classification, processingResults, actions) {
        const timestamp = new Date().toLocaleString();
        const memoryEntry = {
            timestamp,
            fileName,
            classification,
            processingResults,
            actions
        };

        this.memory.unshift(memoryEntry);
        this.updateMemoryDisplay();
    }

    updateMemoryDisplay() {
        if (this.memory.length === 0) {
            this.memoryContent.innerHTML = '<div class="memory-placeholder">Processing history will appear here</div>';
            return;
        }

        const html = this.memory.map(entry => `
            <div class="memory-entry fade-in">
                <div class="memory-entry-header">
                    <strong>${entry.fileName}</strong>
                    <span class="memory-timestamp">${entry.timestamp}</span>
                </div>
                <div><strong>Format:</strong> ${entry.classification.format.detected}</div>
                <div><strong>Intent:</strong> ${entry.classification.intent.type}</div>
                <div><strong>Actions:</strong> ${entry.actions.length} triggered</div>
            </div>
        `).join('');

        this.memoryContent.innerHTML = html;
    }

    clearMemory() {
        this.memory = [];
        this.processedCount = 0;
        this.actionsCount = 0;
        this.documentsProcessed.textContent = '0';
        this.actionsTriggered.textContent = '0';
        this.updateMemoryDisplay();
        this.actionsContent.innerHTML = '<div class="actions-placeholder">Dynamic actions will be triggered based on processing results</div>';
    }

    updatePipelineStep(step, status) {
        const stepElement = document.querySelector(`[data-step="${step}"]`);
        if (!stepElement) return;

        stepElement.classList.remove('active', 'completed');
        if (status !== 'pending') {
            stepElement.classList.add(status);
        }

        const statusIcon = stepElement.querySelector('.step-status');
        switch (status) {
            case 'active':
                statusIcon.textContent = '⚙️';
                break;
            case 'completed':
                statusIcon.textContent = '✅';
                break;
            default:
                statusIcon.textContent = '⏳';
        }
    }

    updateAgentStatus(agentType, status) {
        const agentCard = document.querySelector(`[data-agent="${agentType}"]`);
        
        if (!agentCard) {
            // Handle classifier status
            const classifierStatus = document.getElementById('classifierStatus');
            if (agentType === 'classifier' && classifierStatus) {
                classifierStatus.textContent = status === 'processing' ? 'Processing' : 
                                             status === 'active' ? 'Active' : 'Idle';
                classifierStatus.className = `agent-status ${status}`;
            }
            return;
        }

        const statusElement = agentCard.querySelector('.agent-status');
        if (statusElement) {
            statusElement.textContent = status === 'processing' ? 'Processing' : 
                                       status === 'active' ? 'Active' : 'Standby';
            statusElement.className = `agent-status ${status}`;
        }
        
        if (status === 'active' || status === 'processing') {
            agentCard.classList.add('active');
        } else {
            agentCard.classList.remove('active');
        }
    }

    updateProcessingIndicator(status) {
        if (this.processingIndicator) {
            this.processingIndicator.textContent = status;
            this.processingIndicator.className = status === 'Processing' ? 'processing-indicator active' : 'processing-indicator';
        }
    }

    resetPipeline() {
        // Reset all pipeline steps
        document.querySelectorAll('.pipeline-step').forEach(step => {
            step.classList.remove('active', 'completed');
            const statusEl = step.querySelector('.step-status');
            if (statusEl) statusEl.textContent = '⏳';
        });

        // Reset all agents
        document.querySelectorAll('.agent-card').forEach(card => {
            card.classList.remove('active');
            const status = card.querySelector('.agent-status');
            if (status) {
                status.textContent = 'Standby';
                status.className = 'agent-status';
            }
            
            const results = card.querySelector('.agent-results');
            if (results) results.innerHTML = '';
        });

        // Reset classifier
        this.updateAgentStatus('classifier', 'idle');
        if (this.classificationResults) {
            this.classificationResults.innerHTML = '<div class="classification-placeholder">Upload a document to see classification results</div>';
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Document Processing System...');
    try {
        new DocumentProcessingSystem();
        console.log('System initialized successfully');
    } catch (error) {
        console.error('Failed to initialize system:', error);
    }
});