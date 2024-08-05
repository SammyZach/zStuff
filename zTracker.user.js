// ==UserScript==
// @name         zTracker
// @namespace    http://zarpgaming.com/
// @version      1.0
// @description  Display online players from GameTracker on hover
// @author       Sammy
// @match        https://zarpgaming.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zarpgaming.com
// ==/UserScript==

(function() {
    'use strict';

    GM_addStyle(`
        .gametracker-popup {
            position: absolute;
            padding: 10px;
            border-radius: 8px;
            border: 1px solid #555;
            background: #1a1a1a url(https://www.gametracker.com/images/global/block/bgt_ffffff33_tm.png) repeat-x 0 0;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
            -webkit-box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
            -moz-box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
            color: #fff;
            font-family: "Trebuchet MS", Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            box-sizing: border-box;
            display: none;
            z-index: 1000;
            margin: 5px;
        }
        .gametracker-popup ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .gametracker-popup li {
            margin-bottom: 4px;
            padding: 2px;
            border-radius: 4px;
        }
        .player-name, .gametracker-popup a {
            display: inline;
            margin: 0 5px;
        }
        .player-rank {
            color: #369523;
            font-weight: bold;
        }
        .player-name, .gametracker-popup a {
            color: #FF9900;
        }
        .gametracker-popup a:hover {
            text-decoration: none;
            color: #FF9900;
        }
    `);

    const popup = document.createElement('div');
    popup.className = 'gametracker-popup';
    document.body.appendChild(popup);

    let hoverTimeout;

    function fetchOnlinePlayers(url, callback) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function(response) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(response.responseText, 'text/html');
                const onlinePlayersElement = doc.querySelector('#HTML_online_players');

                if (onlinePlayersElement) {
                    let playersHtml = onlinePlayersElement.innerHTML
                        .replace(/<a\b[^>]*>(.*?)<\/a>/g, '$1') // Remove anchor tags but keep inner text
                        .replace(/href="[^"]*"/gi, '') // Remove href attributes
                        .replace(/<img[^>]+alt="Profile"[^>]*>/gi, '') // Remove profile images
                        .replace(/data-popup="[^"]*"/gi, '') // Remove data-popup attributes
                        .replace(/Rank/g, '<span class="player-rank">Rank</span>') // Style Rank
                        .replace(/Name/g, '<span class="player-name">Name</span>') // Style Name
                    callback(playersHtml);
                } else {
                    callback('<p>Online players data not found.</p>');
                }
            },
            onerror: function() {
                callback('<p>Error fetching online players data. Please try again later.</p>');
            }
        });
    }

    function handleMouseOver(event) {
        const linkElement = event.currentTarget;
        const href = linkElement.getAttribute('href');

        clearTimeout(hoverTimeout);

        hoverTimeout = setTimeout(() => {
            if (href) {
                fetchOnlinePlayers(href, (data) => {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = data;
                    const playerList = tempDiv.querySelector('ul') || tempDiv;

                    popup.innerHTML = '';
                    popup.appendChild(playerList);

                    popup.style.display = 'block';
                    popup.style.left = `${event.pageX + 15}px`;
                    popup.style.top = `${event.pageY + 30}px`;
                });
            }
        }, 500);
    }

    function handleMouseMove(event) {
        popup.style.left = `${event.pageX + 15}px`;
        popup.style.top = `${event.pageY + 30}px`;
    }

    function handleMouseOut() {
        clearTimeout(hoverTimeout);
        popup.style.display = 'none';
    }

    const gametrackerLinks = document.querySelectorAll('a[title="View Gametracker"]');

    if (gametrackerLinks.length > 0) {
        gametrackerLinks.forEach(link => {
            link.addEventListener('mouseover', handleMouseOver);
            link.addEventListener('mousemove', handleMouseMove);
            link.addEventListener('mouseout', handleMouseOut);
        });
    }

    window.addEventListener('beforeunload', () => {
        document.body.removeChild(popup);
    });
})();
