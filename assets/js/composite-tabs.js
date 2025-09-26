
document.addEventListener('DOMContentLoaded', function () {
    const tabLinks = Array.from(document.querySelectorAll('.composite-summary-tabs-nav .tab-link'));
    const tabGroups = Array.from(document.querySelectorAll('.composite-tab-group'));
    const prevBtn = document.querySelector('.composite-tab-prev');
    const nextBtn = document.querySelector('.composite-tab-next');
    const prevLabel = document.querySelector('.tab-prev-label');
    const nextLabel = document.querySelector('.tab-next-label');

    if (!tabLinks.length || !tabGroups.length || !prevBtn || !nextBtn) return;

    const visitedTabs = new Set();
    let currentTabIndex = 0;

    function updateButtons() {
        prevBtn.disabled = currentTabIndex <= 0;
        nextBtn.disabled = currentTabIndex >= tabLinks.length - 1;

        prevLabel.textContent = currentTabIndex > 0 ? tabLinks[currentTabIndex - 1].textContent : '';
        nextLabel.textContent = currentTabIndex < tabLinks.length - 1 ? tabLinks[currentTabIndex + 1].textContent : '';
    }

    function activateTabByIndex(index) {
    const tabKey = tabLinks[index].dataset.tab;
    tabLinks.forEach((link, i) => {
        const isActive = i === index;
        link.classList.toggle('active', isActive);
        if (isActive) {
            visitedTabs.add(tabKey);
            link.classList.add('visited');
        }
    });

    tabGroups.forEach(group => {
        group.classList.toggle('active', group.dataset.tab === tabKey);
    });

    currentTabIndex = index;
    updateButtons();

    // Scroll to the top of the tab nav smoothly
    const activeTabLink = tabLinks[index];
    if (activeTabLink && typeof activeTabLink.scrollIntoView === 'function') {
        activeTabLink.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
}

    // Initialize to first valid tab
    const firstTabIndex = tabLinks.findIndex(link => link.dataset.tab !== 'tab_other');
    activateTabByIndex(firstTabIndex >= 0 ? firstTabIndex : 0);

    tabLinks.forEach((link, i) => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            activateTabByIndex(i);
        });
    });

    prevBtn.addEventListener('click', function () {
        if (currentTabIndex > 0) {
            activateTabByIndex(currentTabIndex - 1);
        }
    });

    nextBtn.addEventListener('click', function () {
        if (currentTabIndex < tabLinks.length - 1) {
            activateTabByIndex(currentTabIndex + 1);
        }
    });
});
