// ==UserScript==
// @name         zTranslate
// @namespace    https://zarpgaming.com/
// @version      1.0
// @description  Add Sinzbabble translation to forum posts using OpenAI's Chat API
// @author       Sammy
// @match        https://zarpgaming.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      api.openai.com
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zarpgaming.com
// ==/UserScript==

(function() {
    'use strict';

    function addApiKeyInput() {
        const iconUser = document.querySelector('.icon-user');
        if (iconUser && !document.getElementById('openaiApiKey')) {
            const apiKeyDiv = document.createElement('div');
            const apiKeyInput = document.createElement('input');
            const checkbox = document.createElement('input');

            apiKeyInput.type = 'password';
            apiKeyInput.placeholder = 'Enter OpenAI API Key';
            apiKeyInput.id = 'openaiApiKey';
            apiKeyInput.value = GM_getValue('openaiApiKey', '');
            apiKeyInput.style.margin = '5px';

            checkbox.type = 'checkbox';
            checkbox.addEventListener('click', () => {
                apiKeyInput.type = checkbox.checked ? 'text' : 'password';
            });

            apiKeyInput.addEventListener('change', () => {
                GM_setValue('openaiApiKey', apiKeyInput.value);
            });

            apiKeyDiv.appendChild(apiKeyInput);
            apiKeyDiv.appendChild(checkbox);
            iconUser.parentNode.insertBefore(apiKeyDiv, iconUser.nextSibling);
        }
    }

    function addTranslateButton() {
        document.querySelectorAll('.kwho-user').forEach(user => {
            if (user.href.includes('/index.php/forum/profile/37312-sinzz')) {
                const msgText = user.closest('.kmsg').querySelector('.kmsgtext');
                const thankYouDiv = msgText.closest('.kmsg').querySelector('.kpost-thankyou');

                if (thankYouDiv && !thankYouDiv.querySelector('.Translate')) {
                    const translateButton = document.createElement('button');
                    translateButton.innerText = 'Translate';
                    translateButton.className = 'Translate kicon-button kbuttonuser btn-left';
                    translateButton.style.marginLeft = '10px';
                    translateButton.style.borderRadius = '3px';
                    thankYouDiv.appendChild(translateButton);

                    translateButton.addEventListener('click', () => {
                        const messageText = msgText.textContent;
                        const apiKey = document.getElementById('openaiApiKey').value;

                        GM_xmlhttpRequest({
                            method: "POST",
                            url: "https://api.openai.com/v1/chat/completions",
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${apiKey}`
                            },
                            data: JSON.stringify({
                                model: "gpt-4o",
                                messages: [{role: "system", content: "Translate broken English to proper English"},
                                           {role: "user", content: messageText}]
                            }),
                            onload: function(response) {
                                const result = JSON.parse(response.responseText);
                                if (result.choices && result.choices[0] && result.choices[0].message) {
                                    const outputDiv = document.createElement('div');
                                    outputDiv.style.backgroundColor = '#F2F1EE';
                                    outputDiv.style.border = '1px dotted #BFC3C6';
                                    outputDiv.style.margin = '5px';
                                    outputDiv.style.fontStyle = 'italic';
                                    outputDiv.innerText = result.choices[0].message.content;

                                    const boldLabel = document.createElement('b');
                                    boldLabel.innerText = 'Translated:';
                                    boldLabel.style.margin = '5px';

                                    msgText.parentNode.appendChild(boldLabel);
                                    msgText.parentNode.appendChild(outputDiv);
                                } else {
                                    console.error('API Response:', result);
                                    alert('Error: Could not retrieve translation.');
                                }
                            },
                            onerror: function(error) {
                                console.error('API Error:', error);
                                alert('An error occurred while fetching the translation.');
                            }
                        });
                    });
                }
            }
        });
    }

    new MutationObserver((mutations, observer) => {
        if (document.querySelector('.icon-user') && document.querySelector('.kwho-user')) {
            addApiKeyInput();
            addTranslateButton();
        }
    }).observe(document.body, {
        childList: true,
        subtree: true
    });
})();
