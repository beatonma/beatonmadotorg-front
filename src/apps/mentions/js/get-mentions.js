const mentions = (() => {
    function getWebmentions() {
        const url = new URL(window.location.protocol + '//' + window.location.host + '/webmention/get');
        url.searchParams.append('url', window.location.pathname);
        fetch(url, {
            method: 'GET',
        }).then((response) => {
            return response.json();
        }).then((data) => {
            if (!data['mentions']) {
                return;
            }
            buildViews(data['mentions']);
        }).catch((err) => {
            console.log(err);
        })
    }

    function buildViews(mentions) {
        const container = document.getElementById('mentions');
        removeChildren(container);
        const content = document.importNode(
            document.getElementById('mentions_container').content,
            true).querySelector('div');
        const miniTemplate = document.getElementById('mention_minimal').content;
        const quoteTemplate = document.getElementById('mention_quote').content;

        const minis = document.createElement('div');
        minis.className = 'flex-row-start';
        const quotables = document.createElement('div');
        quotables.className = 'flex-col';

        for (let i = 0; i < mentions.length; i++) {
            const m = mentions[i];
            const hcard = m['hcard'];
            const homepageText = new URL(hcard['homepage']).hostname;

            const quote = m['quote'];
            let el;
            if (quote) {
                el = document.importNode(quoteTemplate, true);
                el.querySelector('.mention-quote').textContent = quote;
            }
            else {
                el = document.importNode(miniTemplate, true);
                const tooltip = el.querySelector('.hcard-popup');
                tooltip.style.backgroundColor = hcard['primary_color'];
                tooltip.querySelector('.hcard-name').style.color = hcard['foreground_color'];
                tooltip.querySelector('div.hcard-homepage').style.color = hcard['foreground_color'];
            }
            el.querySelector('a.mention-source').setAttribute('href', m['source_url']);
            el.querySelector('a.hcard-homepage, a.mention-homepage').setAttribute('href', hcard['homepage']);
            el.querySelector('.hcard-name, .mention-name').textContent = hcard['name'];
            el.querySelector('div.hcard-homepage, .mention-homepage').textContent = homepageText;
            el.querySelectorAll('.chip').forEach((item) => {
                item.style.backgroundColor = hcard['primary_color'];
                item.style.color = hcard['foreground_color'];
            });
            el.querySelectorAll('.avatar').forEach((item) => {
                item.style.backgroundImage = 'url("' + hcard['avatar'] + '")';
            });

            if (quote) {
                quotables.appendChild(el);
            }
            else {
                minis.appendChild(el);
            }
        }

        if (quotables.childElementCount > 0) {
            content.appendChild(quotables);
        }
        if (minis.childElementCount > 0) {
            content.appendChild(minis);
        }
        if (content.childElementCount > 1) {
            container.classList.add('card');
            container.appendChild(content);
            transitions.in(container);
        }
    }

    getWebmentions();

    return {
        'get': getWebmentions
    }
})();