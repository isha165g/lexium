export function showNotification(
    message,
    type = "info"
) {
    alert(message);
}

export function confirmAction(message) {
    return confirm(message);
}