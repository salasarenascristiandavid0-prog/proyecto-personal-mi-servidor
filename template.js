const commonHead = (title, bg) => `
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;900&display=swap" rel="stylesheet">
        <style>
            :root { --main: #00f2ff; --bg: #020617; --glass: rgba(15, 23, 42, 0.85); --gold: #ffcc00; --crunchy: #F47521; }
            body { font-family: 'Inter', sans-serif; background: var(--bg); color: #f1f5f9; margin: 0; overflow-x: hidden; }
            
            .bg-hero { position: fixed; top:0; left:0; width:100%; height:100%; background: linear-gradient(to bottom, transparent, var(--bg)), url('${bg}') center/cover; z-index:-1; filter: brightness(0.4); }
            
            .hero-container { min-height: 80vh; display: flex; flex-direction: column; justify-content: center; padding: 0 8%; }

            /* BUSCADOR + DESPLIEGUE */
            .search-wrapper { display: flex; align-items: center; gap: 12px; margin-top: 30px; position: relative; max-width: 600px; z-index: 1000; }
            .search-box { flex: 1; background: var(--glass); backdrop-filter: blur(20px); border-radius: 50px; border: 1px solid rgba(255,255,255,0.1); padding: 5px 20px; display: flex; align-items: center; }
            .search-box input { flex: 1; background: transparent; border: none; color: white; padding: 12px; outline: none; font-size: 1.1rem; }
            .btn-dado { background: var(--glass); border: 1px solid var(--main); color: var(--main); padding: 12px; border-radius: 15px; text-decoration: none; font-size: 1.2rem; transition: 0.3s; }
            
            #results-dropdown { position: absolute; top: 110%; left: 0; width: 100%; background: var(--glass); backdrop-filter: blur(30px); border-radius: 20px; overflow: hidden; display: none; border: 1px solid rgba(255,255,255,0.2); }
            .result-item { display: flex; align-items: center; gap: 15px; padding: 12px; text-decoration: none; color: white; border-bottom: 1px solid rgba(255,255,255,0.05); }

            /* TARJETAS CON MOVIMIENTO INTERACTIVO */
            .anime-card { 
                background: var(--glass); border-radius: 20px; overflow: hidden; position: relative; 
                border: 1px solid rgba(255,255,255,0.1); 
                transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s;
                opacity: 0; transform: translateY(20px); 
            }
            .anime-card.visible { opacity: 1; transform: translateY(0); }
            
            /* Efecto interactivo al pasar el dedo o mouse */
            .anime-card:hover, .anime-card:active { 
                transform: scale(1.05) translateY(-10px); 
                box-shadow: 0 15px 35px rgba(0, 242, 255, 0.2);
                border-color: var(--main);
                z-index: 10;
            }

            .popular-border { border: 2.5px solid var(--gold) !important; }
            .badge-popular { position: absolute; top: 10px; right: 10px; background: var(--gold); color: black; padding: 4px 10px; border-radius: 8px; font-size: 0.7rem; font-weight: 900; z-index: 5; }

            .fav-btn { background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 10px; border-radius: 50%; cursor: pointer; position: absolute; top: 10px; left: 10px; z-index: 11; transition: 0.3s; }
            .fav-btn.active { color: #ff4757; background: white; border-color: white; transform: scale(1.1); }

            .section-title { padding: 40px 8% 10px; font-size: 1.6rem; font-weight: 900; color: var(--main); letter-spacing: 2px; }
            .grid-results { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; padding: 20px 8% 60px; }
            @media (min-width: 768px) { .grid-results { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); } }
            
            .card-info { padding: 15px; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); }

            /* TRÁILER REDONDEADO */
            .video-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 25px; margin-top: 30px; border: 1px solid rgba(255,255,255,0.1); }
            .video-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; border-radius: 25px; }

            .btn-crunchy { background: var(--crunchy) !important; color: white !important; border: none !important; }
        </style>
    </head>
`;

const renderCards = (animes) => animes.map(a => {
    const isTop = a.score >= 8.0;
    return `
    <div class="anime-card ${isTop ? 'popular-border' : ''}" data-id="${a.mal_id}">
        <button class="fav-btn" onclick="toggleFav('${a.mal_id}', '${a.title.replace(/'/g, "")}', '${a.images.jpg.large_image_url}', this)">❤</button>
        ${isTop ? '<div class="badge-popular">TOP RATED</div>' : ''}
        <a href="/anime/${a.mal_id}" style="text-decoration:none; color:inherit;">
            <img src="${a.images.jpg.large_image_url}" style="width:100%; aspect-ratio:2/3; object-fit:cover;">
            <div class="card-info">
                <h4 style="margin:0; font-size:0.9rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${a.title}</h4>
                <div style="font-size:0.75rem; color:${isTop ? 'var(--gold)' : 'var(--main)'}; font-weight:bold; margin-top:5px;">⭐ ${a.score || 'N/A'}</div>
            </div>
        </a>
    </div>`;
}).join('');

const commonScript = `
    <script>
        const input = document.getElementById('searchInput');
        const dropdown = document.getElementById('results-dropdown');

        if(input) {
            input.addEventListener('input', async (e) => {
                const q = e.target.value.trim();
                if (q.length < 3) { dropdown.style.display = 'none'; return; }
                try {
                    const res = await fetch('/api/search?q=' + encodeURIComponent(q));
                    const data = await res.json();
                    if (data.length > 0) {
                        dropdown.innerHTML = data.map(a => \`
                            <a href="/anime/\${a.mal_id}" class="result-item">
                                <img src="\${a.images.jpg.small_image_url}" style="width:40px; border-radius:5px;">
                                <div style="font-size:0.85rem; font-weight:600; color:white;">\${a.title}</div>
                            </a>
                        \`).join('');
                        dropdown.style.display = 'block';
                    }
                } catch(e) {}
            });
            input.onkeypress = (e) => { if(e.key === 'Enter') window.location.href = '/search?q=' + encodeURIComponent(input.value); }
        }

        function toggleFav(id, title, img, btn) {
            let favs = JSON.parse(localStorage.getItem('favs')) || [];
            const idx = favs.findIndex(f => f.id == id);
            idx > -1 ? favs.splice(idx, 1) : favs.push({id, title, img});
            localStorage.setItem('favs', JSON.stringify(favs));
            renderFavs();
        }

        function renderFavs() {
            const favs = JSON.parse(localStorage.getItem('favs')) || [];
            const section = document.getElementById('favorites-section');
            const grid = document.getElementById('favs-grid');
            document.querySelectorAll('.fav-btn').forEach(btn => {
                const cardId = btn.closest('.anime-card')?.dataset.id || btn.getAttribute('onclick').match(/'(\\d+)'/)[1];
                favs.some(f => f.id == cardId) ? btn.classList.add('active') : btn.classList.remove('active');
            });
            if(section && favs.length > 0) {
                section.style.display = 'block';
                grid.innerHTML = favs.map(f => \`
                    <div class="anime-card visible" data-id="\${f.id}">
                        <button class="fav-btn active" onclick="toggleFav('\${f.id}', '', '', this)">❤</button>
                        <a href="/anime/\${f.id}"><img src="\${f.img}" style="width:100%; aspect-ratio:2/3; object-fit:cover;"><div class="card-info"><h4>\${f.title}</h4></div></a>
                    </div>
                \`).join('');
            } else if(section) section.style.display = 'none';
        }

        const obs = new IntersectionObserver(ents => ents.forEach(en => en.isIntersecting && en.target.classList.add('visible')), {threshold: 0.1});
        window.onload = () => { 
            renderFavs(); 
            document.querySelectorAll('.anime-card').forEach(c => obs.observe(c)); 
        };
        document.addEventListener('click', (e) => { if (input && !input.contains(e.target)) dropdown.style.display = 'none'; });
    </script>
`;

module.exports = {
    renderHome: (hero, tendencias) => `<!DOCTYPE html><html>${commonHead("AnimeHub Pro", hero.images.jpg.large_image_url)}<body><div class="bg-hero"></div><main class="hero-container"><span style="color:var(--main); font-weight:900; letter-spacing:4px; font-size:0.8rem;">RECOMENDADO</span><h1 style="max-width:800px; font-size:clamp(2.5rem, 6vw, 4rem); font-weight:900; margin:15px 0;">${hero.title}</h1><a href="/anime/${hero.mal_id}" style="background:var(--main); color:black; padding:16px 45px; border-radius:50px; text-decoration:none; font-weight:900; width:fit-content; box-shadow:0 10px 30px rgba(0,242,255,0.3);">VER AHORA</a><div class="search-wrapper"><div class="search-box"><span>🔍</span><input type="text" id="searchInput" placeholder="Buscar anime..." autocomplete="off"></div><a href="/" class="btn-dado">🎲</a><div id="results-dropdown"></div></div></main><div class="section-title">🔥 TENDENCIAS</div><div class="grid-results">${renderCards(tendencias)}</div><div id="favorites-section" style="display:none;"><div class="section-title">💖 MI COLECCIÓN</div><div class="grid-results" id="favs-grid"></div></div>${commonScript}</body></html>`,
    renderSearchResults: (q, results) => `<!DOCTYPE html><html>${commonHead("Resultados", "https://images.alphacoders.com/605/605592.png")}<body><div class="bg-hero" style="filter:brightness(0.2) blur(10px);"></div><div style="padding:40px 8%;"><a href="/" style="color:var(--main); text-decoration:none; font-weight:bold;">⬅ VOLVER</a><h2 class="section-title" style="padding:30px 0;">Resultados para "${q}"</h2><div class="grid-results" style="padding:0;">${renderCards(results)}</div></div>${commonScript}</body></html>`,
    renderDetail: (a, links) => `<!DOCTYPE html><html>${commonHead(a.title, a.images.jpg.large_image_url)}<body><div class="bg-hero" style="filter:brightness(0.3) blur(20px);"></div><div style="padding:50px 8%;"><a href="/" style="color:var(--main); text-decoration:none; font-weight:bold;">⬅ REGRESAR</a><div style="display:flex; gap:50px; flex-wrap:wrap; margin-top:40px;"><img src="${a.images.jpg.large_image_url}" style="width:300px; border-radius:25px; box-shadow:0 30px 60px rgba(0,0,0,0.8);"><div style="flex:1; min-width:320px;"><span style="color:var(--main); font-weight:900;">${a.type} • ⭐ ${a.score || 'N/A'}</span><h1 style="font-size:3.5rem; margin:15px 0;">${a.title}</h1><p style="line-height:1.8; opacity:0.8;">${a.synopsis || ''}</p>${a.trailer.embed_url ? `<div class="video-container"><iframe src="${a.trailer.embed_url}" allowfullscreen></iframe></div>` : ''}<div style="margin-top:40px; display:flex; gap:15px; flex-wrap:wrap;">${links.map(l => `<a href="${l.url}" target="_blank" class="${l.name.includes('Crunchyroll') ? 'btn-crunchy' : ''}" style="padding:15px 30px; background:var(--glass); color:white; border-radius:50px; text-decoration:none; font-weight:bold; border:1px solid rgba(255,255,255,0.1);">${l.name}</a>`).join('')}</div></div></div></div>${commonScript}</body></html>`
};

