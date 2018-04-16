(() => {
    function showSuccess() {
        document.getElementById('contact_form').classList.add('hidden');
        document.getElementById('success_message').classList.remove('hidden');
    }

    function showFailure(response) {
        document.getElementById('failure_message').classList.remove('hidden');
        console.error('[' + response.status + ']: ' + response.statusText);
    }

    const contact = document.getElementById('contact_form');
    contact.addEventListener('submit', (ev) => {
        ev.preventDefault();
        document.getElementById('beatonma_loading').classList.add('loading');

        const form = new FormData(contact);
        const csrftoken = getCookie('csrftoken');
        const headers = new Headers();
        headers.append('X-CSRFToken', csrftoken);

        fetch(contact.getAttribute('action'), {
            headers: headers,
            method: contact.getAttribute('method'),
            body: form,
            credentials: 'same-origin'
        }).then((response) => {
            document.getElementById('beatonma_loading').classList.remove('loading');
            if (response.ok) {
                showSuccess();
            }
            else {
                showFailure(response);
            }
        })
        .catch((err) => {
            console.error(err);
            showFailure();
        });
    }, true);
})();