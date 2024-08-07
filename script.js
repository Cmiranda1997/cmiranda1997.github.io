// script.js
let items = [];
let totalCost = 0;

document.getElementById('addItem').addEventListener('click', function() {
    const itemName = document.getElementById('itemName').value;
    const itemDescription = document.getElementById('itemDescription').value;
    const itemCost = parseFloat(document.getElementById('itemCost').value);
    if(itemName && itemCost) {
        items.push({ name: itemName, description: itemDescription, cost: itemCost });
        updateIframe(items);
    }
});

document.getElementById('estimateForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const clientName = document.getElementById('clientName').value;
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    updateIframe(items, clientName, discount);
});

document.getElementById('saveAsPdf').addEventListener('click', function() {
    saveIframeAsPdf();
});

function updateIframe(items, clientName = '', discount = 0) {
    const iframe = document.getElementById('estimatePreview');
    const doc = iframe.contentDocument || iframe.contentWindow.document;

    let itemsTable = '<table>';
    itemsTable += '<tr><th>Item</th><th>Cost</th></tr>';
    items.forEach(item => {
        itemsTable += `<tr><td>${item.name}`;
        if (item.description) {
            itemsTable += `<br><small>${item.description}</small>`;
        }
        itemsTable += `</td><td>$${item.cost.toFixed(2)}</td></tr>`;
    });
    itemsTable += '</table>';

    let subtotal = items.reduce((acc, item) => acc + item.cost, 0);
    let discountAmount = subtotal * (discount / 100);
    let total = subtotal - discountAmount;

    doc.open();
    doc.write(`
        <html>
            <head>
                <title>Estimate</title>
                <link rel="stylesheet" href="iframe-styles.css">
            </head>
            <body>
                <div class="logo">
                    <img src="logo.png" alt="Company Logo">
                </div>
                <h3>Estimate for: ${clientName}</h3>
                ${itemsTable}
                <div class="total-section">
                    <p class="subtotal"><span>Subtotal:</span><span>$${subtotal.toFixed(2)}</span></p>
                    <p class="discount"><span>Discount:</span><span>$${discountAmount.toFixed(2)}</span></p>
                    <p class="total"><span>Total:</span><span>$${total.toFixed(2)}</span></p>
                </div>
            </body>
        </html>
    `);
    doc.close();

    adjustIframeScale();
}

function adjustIframeScale() {
    const iframe = document.getElementById('estimatePreview');
    const container = iframe.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    const iframeBody = iframeDocument.body;
    const iframeWidth = iframeBody.scrollWidth;
    const iframeHeight = iframeBody.scrollHeight;

    const scaleWidth = containerWidth / iframeWidth;
    const scaleHeight = containerHeight / iframeHeight;

    const scale = Math.min(scaleWidth, scaleHeight);

    iframe.style.transform = `scale(${scale})`;
    iframe.style.width = `${iframeWidth}px`;
    iframe.style.height = `${iframeHeight}px`;
}

window.addEventListener('resize', adjustIframeScale);

function saveIframeAsPdf() {
    const iframe = document.getElementById('estimatePreview');
    const doc = iframe.contentDocument || iframe.contentWindow.document;

    html2canvas(doc.body).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'in',
            format: 'letter'
        });
        pdf.addImage(imgData, 'PNG', 0, 0, 8.5, 11);
        pdf.save('estimate.pdf');
    });
}
