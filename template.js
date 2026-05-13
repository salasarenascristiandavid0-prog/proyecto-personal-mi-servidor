const commonHead = (title, bg) => `
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;900&display=swap" rel="stylesheet">
        <style>
            :root { --main: #00f2ff; --bg: #020617; --glass: rgba(15, 23, 42, 0.85); --gold: #ffcc00; }
            body { font-family: 'Inter', sans-serif; background: var(--bg); color: #f1f5f9; margin: 0; }
            .bg-hero { position: fixed; top:0; left:0; width:100%; height:100%; background: linear-gradient(to bottom, transparent, var(--bg)), url('${bg}') center/cover; z-index:-1; filter: brightness(0.3) blur(20px); transform: scale(1.1); }
            .header-nav { padding: 20px 8%; display: flex; align-items: center; gap: 20px; z-index: 1000; position: relative; }
            .search-container { position: relative; flex: 1; max-width: 600px; }
            .search-box { display: flex; align-items: center; background: var(--glass); backdrop-filter: blur(10px); border-radius: 15px; border: 1px solid rgba(255,255,255,0.1); padding: 5px 15px; }
            .search-box input { flex: 1; background: transparent; border: none; color: white; padding: 12px; outline: none; font-size: 1.1rem; }
            #results-dropdown { position: absolute; top: 115%; left: 0; width: 100%; background: var(--glass); backdrop-filter: blur(20px); border-radius: 15px; overflow: hidden; display: none; border: 1px solid rgba(255,255,255,0.1); }
            .result-item { display: flex; align-items: center; gap: 15px; padding: 12px; text-decoration: none; color: white; border-bottom: 1px solid rgba(255,255,255,0.05); }
            .grid-results { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 25px; padding: 20px 8% 60px; }
            .anime-card { background: var(--glass); border-radius: 15px; overflow: hidden; transition: 0.3s; text-decoration: none; color: white; border: 1px solid rgba(255,255,255,0.05); position: relative; }
            .anime-card:hover { transform: translateY(-8px); border-color: var(--main); }
            .anime-card img { width: 100%; aspect-ratio: 2/3; object-fit: cover; }
            .badge-popular { position: absolute; top: 8px; right: 8px; background: var(--gold); color: black; padding: 3px 8px; border-radius: 6px; font-size: 0.65rem; font-weight: 900; }
            .card-info { padding: 12px; }
            .card-info h3 { font-size: 0.85rem; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .hero-content { height: 60vh; display: flex; flex-direction: column; justify-content: center; padding: 0 8%; }
            .btn-detail { margin-top: 20px; padding: 14px 35px; background: var(--main); color: var(--bg); border: none; border-radius: 50px; font-weight: 900; text-decoration: none; width: fit-content; }
        </style>
    </head>
`;

const searchScript = `
    <script>
        const input = document.getElementById('searchInput');
        const dropdown = document.getElementById('results-dropdown');
        input.addEventListener('input', async (e) => {
            const q = e.target.value;
            if (q.length < 3) { dropdown.style.display = 'none'; return; }
            const res = await fetch('/api/search?q=' + encodeURIComponent(q));
            const data = await res.json();
            if (data.length > 0) {
                dropdown.innerHTML = data.map(a => \`<a href="/anime/\${a.mal_id}" class="result-item"><img src="\${a.images.jpg.small_image_url}" style="width:35px; border-radius:3px;"><div style="font-size:0.8rem;">\${a.title}</div></a>\`).join('');
                dropdown.style.display = 'block';
            }
        });
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && input.value.length >= 2) window.location.href = '/search?q=' + encodeURIComponent(input.value);
        });
        document.addEventListener('click', (e) => { if (!input.contains(e.target)) dropdown.style.display = 'none'; });
    </script>
`;

const helperRenderCards = (animes) => {
    if (!animes) return '';
    return animes.map(a => {
        const isPopular = a.score >= 8.2;
        return `
            <a href="/anime/${a.mal_id}" class="anime-card" style="${isPopular ? 'border: 1px solid var(--gold)' : ''}">
                ${isPopular ? '<div class="badge-popular">TOP</div>' : ''}
                <img src="${a.images.jpg.large_image_url}">
                <div class="card-info">
                    <h3>${a.title}</h3>
                    <span style="color:${isPopular ? 'var(--gold)' : 'var(--main)'}; font-size:0.7rem;">⭐ ${a.score || 'N/A'}</span>
                </div>
            </a>
        `;
    }).join('');
};

// EXPORTACIÓN CRITICA: Asegúrate de que esto esté al final
module.exports = {
    renderHome: (hero, tendencias) => `
        <!DOCTYPE html>
        <html lang="es">
        ${commonHead("AnimeHub | Inicio", hero.images.jpg.large_image_url)}
        <body>
            <div class="bg-hero" style="filter: brightness(0.4) blur(5px);"></div>
            <header class="header-nav">
                <div class="search-container">
                    <div class="search-box"><span>🔍</span><input type="text" id="searchInput" placeholder="Buscar anime..." autocomplete="off"></div>
                    <div id="results-dropdown"></div>
                </div>
                <a href="/" style="text-decoration:none; background:var(--glass); padding:10px; border-radius:12px; border:1px solid var(--main); color:var(--main);">🎲</a>
            </header>
            <main class="hero-content">
                <h1 style="font-size:3.5rem; margin:0;">${hero.title}</h1>
                <a href="/anime/${hero.mal_id}" class="btn-detail">VER DETALLES</a>
            </main>
            <h2 style="padding: 30px 8% 0; color:var(--main); letter-spacing:2px;">🔥 TENDENCIAS</h2>
            <div class="grid-results">${helperRenderCards(tendencias)}</div>
            ${searchScript}
        </body>
        </html>
    `,

    renderSearchResults: (query, results) => `
        <!DOCTYPE html>
        <html lang="es">
        ${commonHead("Resultados: " + query, "https://images.alphacoders.com/605/605592.png")}
        <body>
            <div class="bg-hero"></div>
            <header class="header-nav">
                <div class="search-container">
                    <div class="search-box"><span>🔍</span><input type="text" id="searchInput" placeholder="Buscar..." autocomplete="off"></div>
                    <div id="results-dropdown"></div>
                </div>
                <a href="/" style="color:white; text-decoration:none;">🏠 INICIO</a>
            </header>
            <h2 style="padding: 20px 8%;">Resultados para: "${query}"</h2>
            <div class="grid-results">${helperRenderCards(results)}</div>
            ${searchScript}
        </body>
        </html>
    `,

    renderDetail: (anime, links) => `
        <!DOCTYPE html>
        <html lang="es">
        ${commonHead(anime.title, anime.images.jpg.large_image_url)}
        <body>
            <div class="bg-hero"></div>
            <div style="padding: 20px 8%;"><a href="/" style="color:white; text-decoration:none; opacity:0.7;">⬅ VOLVER</a></div>
            <div style="padding: 0 8%; display:flex; gap:40px; flex-wrap:wrap;">
                <img src="${anime.images.jpg.large_image_url}" style="width:280px; border-radius:15px; box-shadow:0 20px 40px #000;">
                <div style="flex:1; min-width:300px;">
                    <h1>${anime.title}</h1>
                    <p style="color:#cbd5e1; line-height:1.6;">${anime.synopsis || 'Sin descripción.'}</p>
                    ${anime.trailer.embed_url ? `<div style="width:100%; max-width:550px; aspect-ratio:16/9; border-radius:15px; overflow:hidden; background:#000;"><iframe width="100%" height="100%" src="${anime.trailer.embed_url}" frameborder="0" allowfullscreen></iframe></div>` : ''}
                    <div style="margin-top:30px;">
                        ${links.map((l, i) => `<a href="${l.url}" target="_blank" style="display:inline-block; padding:12px 25px; background:${i===0 ? '#f47521' : 'var(--glass)'}; color:white; border-radius:50px; text-decoration:none; margin:5px; font-weight:bold; border:1px solid rgba(255,255,255,0.1);">${l.name}</a>`).join('')}
                    </div>
                </div>
            </div>
            ${searchScript}
        </body>
        </html>
    `
};

