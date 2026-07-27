// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    window.app = new MainController();
    await window.app.init();

    // Default to admin view if we are on the admin page
    const path = window.location.pathname;
    if (path.includes('admin.html') || path.includes('/course/admin/') || path.includes('course-admin')) {
        await window.app.switchView('admin');
    }
});