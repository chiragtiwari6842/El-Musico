let messageElement = document.getElementById('suggestion-message');
if (!messageElement) {
    messageElement = document.createElement('div');
    // messageElement.id = 'suggestion-message';
    messageElement.style.position = 'fixed';
    messageElement.style.bottom = '100px';
    messageElement.style.right = '60px';
    messageElement.style.backgroundColor = '#333';
    messageElement.style.color = '#fff';
    messageElement.style.border = '4px solid #055ada';
    messageElement.style.padding = '15px';
    messageElement.style.borderRadius = '15px';
    messageElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
    messageElement.style.opacity = '0';
    messageElement.style.transition = 'opacity 0.5s, transform 0.3s';
    messageElement.style.fontFamily = getComputedStyle(document.body).fontFamily;
    messageElement.style.pointerEvents = 'none';
    document.body.appendChild(messageElement);
}
if (window.innerWidth > 768) {
    messageElement.textContent = 'Press H or CTRL + H for shortcuts bar';
    messageElement.style.opacity = '1';
    setTimeout(() => {
        messageElement.style.opacity = '0';
    }, 3000);
}
