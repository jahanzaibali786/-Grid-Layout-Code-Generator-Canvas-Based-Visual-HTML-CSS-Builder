let isDrawing = false;
let startX, startY;
let currentBox = null;
let boxes = [];
let boxCounter = 1;
let deletedNumbers = [];

const canvas = document.getElementById('canvas');
const htmlCode = document.getElementById('html-code');
const cssCode = document.getElementById('css-code');
const boxCount = document.getElementById('box-count');
const coverage = document.getElementById('coverage');

// Tab switching
document.querySelectorAll('.code-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.code-block').forEach(c => c.classList.add('hidden'));

        tab.classList.add('active');
        document.getElementById(tab.dataset.tab + '-code').classList.remove('hidden');
    });
});

function updateBoxName(boxId, newName) {
    const box = boxes.find(b => b.id === boxId);
    if (box) {
        box.name = newName || `Box ${box.number}`;
        updateCode();
    }
}

function triggerImageUpload(boxId) {
    document.getElementById(`upload-${boxId}`).click();
}

function handleImageUpload(boxId, input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const box = boxes.find(b => b.id === boxId);
        const boxElement = document.getElementById(boxId);

        if (box && boxElement) {
            box.backgroundImage = e.target.result;
            boxElement.style.backgroundImage = `url('${e.target.result}')`;
            boxElement.style.backgroundSize = 'cover';
            boxElement.style.backgroundPosition = 'center';
            boxElement.style.backgroundRepeat = 'no-repeat';

            // Make text more readable over image
            boxElement.style.color = 'white';
            boxElement.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';

            // Add class to show remove button
            boxElement.classList.add('has-image');

            updateCode();
        }
    };
    reader.readAsDataURL(file);
}

// Update the removeImage function
function removeImage(boxId) {
    const box = boxes.find(b => b.id === boxId);
    const boxElement = document.getElementById(boxId);

    if (box && boxElement) {
        box.backgroundImage = null;
        boxElement.style.backgroundImage = '';
        boxElement.style.backgroundSize = '';
        boxElement.style.backgroundPosition = '';
        boxElement.style.backgroundRepeat = '';
        boxElement.style.color = '';
        boxElement.style.textShadow = '';

        // Remove class to hide remove button
        boxElement.classList.remove('has-image');

        updateCode();
    }
}
// Window controls functionality
document.querySelector('.maximize-btn').addEventListener('click', toggleFullscreen);

function toggleFullscreen() {
    const canvasArea = document.querySelector('.canvas-area');

    if (canvasArea.classList.contains('fullscreen')) {
        canvasArea.classList.remove('fullscreen');
        document.body.style.overflow = 'auto';
    } else {
        canvasArea.classList.add('fullscreen');
        document.body.style.overflow = 'hidden';
    }
    setTimeout(() => {
        updateCode();
    }, 100);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const canvasArea = document.querySelector('.canvas-area');
        if (canvasArea.classList.contains('fullscreen')) {
            canvasArea.classList.remove('fullscreen');
            document.body.style.overflow = 'auto';
            setTimeout(() => {
                updateCode();
            }, 100);
        }
    }
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isCanvasMaximized) {
        toggleCanvasFullscreen();
    }
});
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);

function startDrawing(e) {
    if (e.target !== canvas) return;

    isDrawing = true;
    canvas.classList.add('drawing');

    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;

    currentBox = document.createElement('div');
    currentBox.className = 'grid-box';
    currentBox.style.left = startX + 'px';
    currentBox.style.top = startY + 'px';
    currentBox.style.width = '0px';
    currentBox.style.height = '0px';

    canvas.appendChild(currentBox);
}
let isCanvasMaximized = false;

function toggleCanvasFullscreen() {
    const canvasArea = document.querySelector('.canvas-area');
    const maximizeBtn = document.querySelector('.canvas-maximize-btn');

    if (isCanvasMaximized) {
        // Minimize
        canvasArea.classList.remove('fullscreen');
        document.body.style.overflow = 'auto';
        maximizeBtn.innerHTML = '⛶ Maximize';
        isCanvasMaximized = false;
    } else {
        canvasArea.classList.add('fullscreen');
        document.body.style.overflow = 'hidden';
        maximizeBtn.innerHTML = '⊟ Minimize';
        isCanvasMaximized = true;
    }

    setTimeout(() => {
        updateCode();
    }, 100);
}
function draw(e) {
    if (!isDrawing || !currentBox) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    const left = Math.min(currentX, startX);
    const top = Math.min(currentY, startY);

    currentBox.style.left = left + 'px';
    currentBox.style.top = top + 'px';
    currentBox.style.width = width + 'px';
    currentBox.style.height = height + 'px';
}

function stopDrawing(e) {
    if (!isDrawing || !currentBox) return;

    isDrawing = false;
    canvas.classList.remove('drawing');

    const width = parseInt(currentBox.style.width);
    const height = parseInt(currentBox.style.height);

    if (width < 30 || height < 30) {
        currentBox.remove();
        currentBox = null;
        return;
    }

    let boxNumber;
    if (deletedNumbers.length > 0) {
        deletedNumbers.sort((a, b) => a - b);
        boxNumber = deletedNumbers.shift();
    } else {
        boxNumber = boxCounter++;
    }

    const boxId = 'box-' + boxNumber;
    currentBox.id = boxId;
    currentBox.innerHTML = `
        <div class="box-controls">
            <button class="control-btn" onclick="triggerImageUpload('${boxId}')">📷 Image</button>
            <button class="control-btn remove-image" onclick="removeImage('${boxId}')">🗑️ Remove</button>
        </div>
        <div class="box-content">
            <input type="text" class="box-name" value="Box ${boxNumber}" onchange="updateBoxName('${boxId}', this.value)" onclick="event.stopPropagation()">
        </div>
        <button class="delete-btn" onclick="deleteBox('${boxId}')">&times;</button>
        <input type="file" class="image-upload" id="upload-${boxId}" accept="image/*" onchange="handleImageUpload('${boxId}', this)">
    `;

    makeBoxDraggable(currentBox);

    boxes.push({
        id: boxId,
        number: boxNumber,
        name: `Box ${boxNumber}`,
        element: currentBox,
        left: parseInt(currentBox.style.left),
        top: parseInt(currentBox.style.top),
        width: parseInt(currentBox.style.width),
        height: parseInt(currentBox.style.height),
        backgroundImage: null
    });

    currentBox = null;
    updateCode();
    updateStats();
}

function makeBoxDraggable(box) {
    let isDragging = false;
    let dragStartX, dragStartY, boxStartX, boxStartY;

    box.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('delete-btn') ||
            e.target.classList.contains('control-btn') ||
            e.target.classList.contains('box-name')) return;
        e.stopPropagation();

        isDragging = true;
        box.classList.add('selected');

        dragStartX = e.clientX;
        dragStartY = e.clientY;
        boxStartX = parseInt(box.style.left);
        boxStartY = parseInt(box.style.top);

        canvas.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;

        const newLeft = Math.max(0, Math.min(canvas.offsetWidth - box.offsetWidth, boxStartX + deltaX));
        const newTop = Math.max(0, Math.min(canvas.offsetHeight - box.offsetHeight, boxStartY + deltaY));

        box.style.left = newLeft + 'px';
        box.style.top = newTop + 'px';

        updateBoxInArray(box.id, newLeft, newTop);
        updateCode();
    });

    document.addEventListener('mouseup', () => {
        if (!isDragging) return;

        isDragging = false;
        box.classList.remove('selected');
        canvas.style.cursor = 'crosshair';
    });
}

function updateBoxInArray(boxId, left, top) {
    const box = boxes.find(b => b.id === boxId);
    if (box) {
        box.left = left;
        box.top = top;
    }
}

function deleteBox(boxId) {
    const boxElement = document.getElementById(boxId);
    const boxData = boxes.find(b => b.id === boxId);

    if (boxElement && boxData) {
        deletedNumbers.push(boxData.number);

        boxElement.remove();
        boxes = boxes.filter(b => b.id !== boxId);
        updateCode();
        updateStats();
    }
}

function updateCode() {
    let html = '<span class="tag">&lt;div</span> <span class="attribute">class</span>=<span class="value">"grid-container"</span><span class="tag">&gt;</span><br>';

    boxes.forEach((box, index) => {
        html += `&nbsp;&nbsp;<span class="tag">&lt;div</span> <span class="attribute">class</span>=<span class="value">"grid-item item-${box.number}"</span><span class="tag">&gt;</span>${box.name}<span class="tag">&lt;/div&gt;</span><br>`;
    });

    html += '<span class="tag">&lt;/div&gt;</span>';
    htmlCode.innerHTML = html;

    let css = '<span class="selector">.grid-container</span> {<br>';
    css += '&nbsp;&nbsp;<span class="property">position</span>: <span class="value">relative</span>;<br>';
    css += '&nbsp;&nbsp;<span class="property">width</span>: <span class="value">100%</span>;<br>';
    css += `&nbsp;&nbsp;<span class="property">height</span>: <span class="value">${canvas.offsetHeight}px</span>;<br>`;
    css += '}<br><br>';

    css += '<span class="selector">.grid-item</span> {<br>';
    css += '&nbsp;&nbsp;<span class="property">position</span>: <span class="value">absolute</span>;<br>';
    css += '&nbsp;&nbsp;<span class="property">background</span>: <span class="value">#f3f4f6</span>;<br>';
    css += '&nbsp;&nbsp;<span class="property">border</span>: <span class="value">1px solid #d1d5db</span>;<br>';
    css += '&nbsp;&nbsp;<span class="property">border-radius</span>: <span class="value">6px</span>;<br>';
    css += '&nbsp;&nbsp;<span class="property">padding</span>: <span class="value">20px</span>;<br>';
    css += '&nbsp;&nbsp;<span class="property">display</span>: <span class="value">flex</span>;<br>';
    css += '&nbsp;&nbsp;<span class="property">align-items</span>: <span class="value">center</span>;<br>';
    css += '&nbsp;&nbsp;<span class="property">justify-content</span>: <span class="value">center</span>;<br>';
    css += '}<br><br>';

    boxes.forEach((box, index) => {
        const leftPercent = ((box.left / canvas.offsetWidth) * 100).toFixed(2);
        const topPercent = ((box.top / canvas.offsetHeight) * 100).toFixed(2);
        const widthPercent = ((box.width / canvas.offsetWidth) * 100).toFixed(2);
        const heightPercent = ((box.height / canvas.offsetHeight) * 100).toFixed(2);

        css += `<span class="selector">.item-${box.number}</span> {<br>`;
        css += `&nbsp;&nbsp;<span class="property">left</span>: <span class="value">${leftPercent}%</span>;<br>`;
        css += `&nbsp;&nbsp;<span class="property">top</span>: <span class="value">${topPercent}%</span>;<br>`;
        css += `&nbsp;&nbsp;<span class="property">width</span>: <span class="value">${widthPercent}%</span>;<br>`;
        css += `&nbsp;&nbsp;<span class="property">height</span>: <span class="value">${heightPercent}%</span>;<br>`;

        if (box.backgroundImage) {
            css += `&nbsp;&nbsp;<span class="property">background-image</span>: <span class="value">url('${box.backgroundImage}')</span>;<br>`;
            css += `&nbsp;&nbsp;<span class="property">background-size</span>: <span class="value">cover</span>;<br>`;
            css += `&nbsp;&nbsp;<span class="property">background-position</span>: <span class="value">center</span>;<br>`;
            css += `&nbsp;&nbsp;<span class="property">background-repeat</span>: <span class="value">no-repeat</span>;<br>`;
        }

        css += '}<br><br>';
    });

    cssCode.innerHTML = css;
}

function updateStats() {
    boxCount.textContent = `${boxes.length} box${boxes.length !== 1 ? 'es' : ''}`;

    const totalArea = canvas.offsetWidth * canvas.offsetHeight;
    const coveredArea = boxes.reduce((total, box) => total + (box.width * box.height), 0);
    const coveragePercent = ((coveredArea / totalArea) * 100).toFixed(1);

    coverage.textContent = `${coveragePercent}% coverage`;
}

function clearAll() {
    boxes.forEach(box => box.element.remove());
    boxes = [];
    boxCounter = 1;
    deletedNumbers = [];
    updateCode();
    updateStats();
}

function copyCode() {
    const activeTab = document.querySelector('.code-tab.active').dataset.tab;
    const codeElement = document.getElementById(activeTab + '-code');
    const temp = document.createElement('div');
    temp.innerHTML = codeElement.innerHTML;
    const plainText = temp.textContent || temp.innerText || '';

    navigator.clipboard.writeText(plainText).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.background = '#10b981';

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 2000);
    });
}

// Initialize
updateCode();
updateStats();
