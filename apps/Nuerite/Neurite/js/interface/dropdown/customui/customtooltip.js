class Tooltip {
    constructor(options = {}) {
        this.tooltipElement = null;
        this.options = {
            offsetX: 0,
            zIndex: 500,
            width: '360px',
            ...options
        };
    }

    attachTooltipEvents(element){ this.switchTooltipEvents(On, element) }
    detachTooltipEvents(element){ this.switchTooltipEvents(Off, element) }
    switchTooltipEvents(status, element) {
        status.mouseenter(element, this.onMouseEnter);
        status.mouseleave(element, this.onMouseLeave);
        status.click(element, Event.preventDefault);
    }
    onMouseEnter = (e)=>{
        const snippetDataList = JSON.parse(e.target.dataset.snippetData);
        this.showTooltip(snippetDataList, e);
    }
    onMouseLeave = (e) => {
        if (!e.relatedTarget || !this.tooltipElement || !this.tooltipElement.contains(e.relatedTarget)) {
            this.hideTooltip();
        }
    };

    showTooltip(data, event) {
        if (!this.tooltipElement) {
            this.createTooltipElement();
        }
        this.updateTooltipContent(data);
        this.positionTooltip(event);
        this.tooltipElement.style.display = 'block';
    }

    positionTooltip(event) {
        const x = event.clientX + this.options.offsetX;
        const y = event.clientY;

        this.tooltipElement.style.left = `${x}px`;
        this.tooltipElement.style.top = `${y}px`;

        requestAnimationFrame(() => {
            const tooltipRect = this.tooltipElement.getBoundingClientRect();
            const newY = y - tooltipRect.height / 2;
            this.tooltipElement.style.top = `${newY}px`;
        });
    }

    hideTooltip() {
        if (this.tooltipElement) {
            this.tooltipElement.style.display = 'none';
        }
    }

    createTooltipElement() {
        const div = Html.make.div('tooltip');
        div.style.position = 'fixed';
        div.style.zIndex = this.options.zIndex;
        div.style.width = this.options.width;
        div.style.pointerEvents = 'auto';

        On.mouseleave(div, (e) => {
            if (!e.relatedTarget || !e.relatedTarget.hasAttribute('data-snippet-data')) {
                this.hideTooltip();
            }
        });

        On.click(div, Event.stopPropagation);

        On.mousedown(div, (e) => {
            App.menuContext.hide();
            e.stopPropagation();
        });

        document.body.appendChild(div);

        // Assign the created tooltip element to this.tooltipElement
        this.tooltipElement = div;
    }


    updateTooltipContent(data) {
        // Placeholder method to be overridden by subclasses
        this.tooltipElement.innerHTML = '';
    }
}

class TopNChunksTooltip extends Tooltip {
    constructor(options = {}) {
        super(options);
        this.highlightClass = 'tooltip-highlight';
        this.currentAiResponseDiv = null;
        this.minMatchLength = options.minMatchLength || 5; // Default to 5 if not provided
    }

    updateTooltipContent(data) {
        this.tooltipElement.innerHTML = data.map(item => `
            <div class="vdb-search-result">
                <div class="vdb-result-header">
                    <div class="vdb-result-source">${item.source}</div>
                    <div class="vdb-result-score">Relevance: <br />${item.relevanceScore.toFixed(3)}</div>
                </div>
                <div class="vdb-result-text custom-scrollbar">${item.text}</div>
            </div>
        `).join('');
    }

    highlightMatches() {
        if (!this.currentAiResponseDiv) return;

        const aiResponseText = this.currentAiResponseDiv.innerText;
        const tooltipResultTexts = this.tooltipElement.querySelectorAll('.vdb-result-text');

        tooltipResultTexts.forEach(resultTextElement => {
            const resultText = resultTextElement.innerText;
            const matches = this.findMatches(aiResponseText, resultText);
            this.applyHighlights(this.currentAiResponseDiv, matches);
            this.applyHighlights(resultTextElement, matches);
        });
    }

    findMatches(text1, text2) {
        const matches = new Set();
        const maxMatchLength = 20; // Adjust this value as needed
        const regex = new RegExp(`\\b(\\w+(?:\\s+\\w+){${this.minMatchLength - 1},${maxMatchLength - 1}})\\b`, 'g');
        let match;

        while ((match = regex.exec(text1)) !== null) {
            const phrase = match[1].toLowerCase(); // Convert to lowercase immediately
            if (text2.toLowerCase().includes(phrase)) {
                matches.add(phrase);
            }
        }

        return Array.from(matches).sort((a, b) => b.length - a.length);
    }

    applyHighlights(element, matches) {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
            if (node.parentNode.className === this.highlightClass) continue;
            let nodeContent = node.textContent;
            let highlightedContent = nodeContent;
            let hasChanges = false;

            matches.forEach(phrase => {
                const regex = new RegExp(`(${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                if (regex.test(nodeContent)) {
                    highlightedContent = highlightedContent.replace(regex, `<span class="${this.highlightClass}">$1</span>`);
                    hasChanges = true;
                }
            });

            if (hasChanges) {
                const fragment = document.createRange().createContextualFragment(highlightedContent);
                node.parentNode.replaceChild(fragment, node);
            }
        }
    }

    removeHighlights(element) {
        const highlights = element.querySelectorAll(`.${this.highlightClass}`);
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });
    }

    showTooltip(data, event) {
        super.showTooltip(data, event);
        this.currentAiResponseDiv = event.target.closest('.response-wrapper').querySelector('.ai-response');
        this.highlightMatches();
    }

    hideTooltip() {
        if (this.currentAiResponseDiv) {
            this.removeHighlights(this.currentAiResponseDiv);
        }
        this.removeHighlights(this.tooltipElement);
        this.currentAiResponseDiv = null;
        super.hideTooltip();
    }

    removeHighlights(element) {
        const highlights = element.querySelectorAll(`.${this.highlightClass}`);
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });
    }
}

function testToolTipRegex(text1, text2, minMatchLength = 5, maxMatchLength = 20) {
    const matches = new Set();

    // Preprocess the texts: convert to lowercase and remove punctuation except apostrophes
    const processText = (text) => text.toLowerCase().replace(/[^\w\s'']/g, '').trim();
    const processedText1 = processText(text1);
    const processedText2 = processText(text2);

    Logger.info("Processed Text 1:", processedText1);
    Logger.info("Processed Text 2:", processedText2);

    // Split into words
    const words1 = processedText1.split(/\s+/);
    const words2 = processedText2.split(/\s+/);

    Logger.info("Words 1:", words1);
    Logger.info("Words 2:", words2);

    // Find matches
    for (let i = 0; i <= words1.length - minMatchLength; i++) {
        for (let length = minMatchLength; length <= Math.min(maxMatchLength, words1.length - i); length++) {
            const phrase = words1.slice(i, i + length).join(' ');
            Logger.info("Checking phrase:", phrase);
            if (processedText2.includes(phrase)) {
                Logger.info("Match found:", phrase);
                matches.add(phrase);
            }
        }
    }

    return Array.from(matches).sort((a, b) => b.length - a.length);
}

function runToolTipTests() {
    const testCases = [
        {
            name: "Basic matching",
            text1: "The quick brown fox jumps over the lazy dog",
            text2: "A quick brown fox jumped over a lazy dog",
            expected: ["quick brown fox", "over the lazy dog", "the lazy dog"]
        },
        {
            name: "Matching with punctuation",
            text1: "Hello, world! How are you today?",
            text2: "Hello world. How are you?",
            expected: ["hello world", "how are you"]
        },
        {
            name: "Matching with apostrophes",
            text1: "It's a beautiful day in the neighborhood",
            text2: "Its a beautiful day in this neighborhood",
            expected: ["a beautiful day in the", "beautiful day in the"]
        },
        {
            name: "Matching across sentence boundaries",
            text1: "This is a test. It should match across sentences.",
            text2: "This is a test it should match across",
            expected: ["this is a test", "it should match across"]
        },
        {
            name: "Matching with different word orders",
            text1: "The cat sat on the mat",
            text2: "On the mat sat a cat",
            expected: ["the cat sat on the", "cat sat on the mat", "on the mat"]
        }
    ];

    testCases.forEach(testCase => {
        Logger.info("Running test:", testCase.name);
        const result = testToolTipRegex(testCase.text1, testCase.text2);
        Logger.info("Result:", result);
        Logger.info("Expected:", testCase.expected);
        Logger.info("Pass:", JSON.stringify(result.sort()) === JSON.stringify(testCase.expected.sort()));
        Logger.info("--------------------");
    });
}

//runToolTipTests();
