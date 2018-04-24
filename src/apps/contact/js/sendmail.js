const contact = (() => {
    function showSuccess() {
        document.getElementById('contact_form').classList.add('hidden');
        document.getElementById('success_message').classList.remove('hidden');
    }

    function showFailure(response) {
        document.getElementById('failure_message').classList.remove('hidden');
        console.error('[' + response.status + ']: ' + response.statusText);
    }

    // const contact = document.getElementById('contact_form');
    // contact.addEventListener('submit', (ev) => {
    //     ev.preventDefault();
        // grecaptcha.execute();
        // document.getElementById('beatonma_loading').classList.add('loading');

        // const form = new FormData(contact);
        // const csrftoken = getCookie('csrftoken');
        // const headers = new Headers();
        // headers.append('X-CSRFToken', csrftoken);

        // fetch('/contact/send', {
        //     headers: headers,
        //     method: 'POST',
        //     body: form,
        //     credentials: 'same-origin'
        // }).then((response) => {
        //     document.getElementById('beatonma_loading').classList.remove('loading');
        //     if (response.ok) {
        //         showSuccess();
        //     }
        //     else {
        //         showFailure(response);
        //     }
        // })
        // .catch((err) => {
        //     console.error(err);
        //     showFailure();
        // });
    // }, true);

    function onSubmit(recaptchaToken) {
        const contact = document.getElementById('contact_form');
        document.getElementById('beatonma_loading').classList.add('loading');

        const form = new FormData(contact);
        const csrftoken = getCookie('csrftoken');
        const headers = new Headers();
        headers.append('X-CSRFToken', csrftoken);

        fetch('/contact/send', {
            headers: headers,
            method: 'POST',
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
    }

    return {
        'showSuccess': showSuccess,
        'showFailure': showFailure,
        'onSubmit': onSubmit
    };
})();


function onSubmit(recaptchaToken) {
    const frm = document.getElementById('contact_form');
    document.getElementById('beatonma_loading').classList.add('loading');

    const form = new FormData(frm);
    const csrftoken = getCookie('csrftoken');
    const headers = new Headers();
    headers.append('X-CSRFToken', csrftoken);

    fetch('/contact/send', {
        headers: headers,
        method: 'POST',
        body: form,
        credentials: 'same-origin'
    }).then((response) => {
        document.getElementById('beatonma_loading').classList.remove('loading');
        if (response.ok) {
            contact.showSuccess();
        }
        else {
            contact.showFailure(response);
        }
    })
    .catch((err) => {
        console.error(err);
        contact.showFailure();
    });
}