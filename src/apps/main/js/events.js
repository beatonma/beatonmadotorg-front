const events = (() => {
    const onPageChangeEvent = new Event('onPageChange');
    const onPageExitEvent = new Event('onPageExit');

    return {
        onPageChange: onPageChangeEvent,
        onPageExit: onPageExitEvent
    }
})();