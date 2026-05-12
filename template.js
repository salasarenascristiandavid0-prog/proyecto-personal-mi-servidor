module.exports = (title, imageUrl, id, synopsis, mode = "", meta = {}, extras = {}) => {
    const finalImage = imageUrl || "https://images.alphacoders.com/605/605592.png";
    
    // Generar etiquetas con estilo especial para la recomendada (la primera)
    const streamingTags = extras.external && extras.external.length > 0 
        ? extras.external.map((link, index) => {
            const isRecommended = index === 0;
            // Naranja Crunchyroll para la primera etiqueta, Cyan para las demás
            const style = isRecommended 
                ? 'background: #f47521; border-color: #ff9d5c; color: white; box-shadow: 0 0 15px rgba(244, 117, 33, 0.4);' 
                : '';
            
            return `<a href="${link.url}" target="_blank" class="tag-platform" style="${style}">${link.name}</a>`;
          }).join('')
        : '<span style="opacity:0.5;">Sin plataformas.</span>';

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AnimeHub | ${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
        <style>
            :root { --main: #00f2ff; --bg: #020617; --glass: rgba(15, 23, 42, 0.7); }
            body { font-family: 'Inter', sans-serif; background-color: var(--bg); color: #f1f5f9; margin: 0; overflow-x: hidden; }
            
            .bg-blur { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-image: url('${finalImage}'); background-size: cover; background-position: center; z-index: -2; filter: brightness(0.15) blur(30px); }
            
            .app-container { display: flex; gap: 40px; min-height: 100vh; padding: 40px 8%; align-items: flex-start; flex-wrap: wrap; }
            
            .poster-aside { flex: 0 0 250px; position: sticky; top: 40px; animation: float 5s ease-in-out infinite; }
            .poster-aside img { width: 100%; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); border: 1px solid rgba(255,255,255,0.1); }
            @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }

            .main-content { flex: 1; min-width: 320px; }

            .nav-group { display: flex; gap: 10px; margin-bottom: 25px; }
            .search-bar { flex: 1; display: flex; background: var(--glass); backdrop-filter: blur(10px); padding: 5px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
            input { flex: 1; background: transparent; border: none; color: white; padding: 10px; outline: none; }
            .btn-search { background: var(--main); color: var(--bg); border: none; padding: 0 15px; border-radius: 8px; font-weight: 800; cursor: pointer; }

            h1 { font-size: 3rem; font-weight: 900; margin: 0 0 10px 0; line-height: 1.1; }
            .meta-tags { display: flex; gap: 10px; margin-bottom: 20px; }
            .meta-tags span { background: rgba(0,242,255,0.1); color: var(--main); padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; border: 1px solid var(--main); }
            
            .description { font-size: 1rem; line-height: 1.7; color: #cbd5e1; margin-bottom: 25px; height: 100px; overflow-y: auto; }

            .trailer-wrap { width: 100%; max-width: 550px; aspect-ratio: 16/9; border-radius: 15px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); margin: 30px 0; background: #000; }

            .platform-label { font-size: 0.75rem; color: var(--main); font-weight: 900; letter-spacing: 2px; margin-bottom: 15px; display: block; }
            .tags-wrapper { display: flex; gap: 10px; flex-wrap: wrap; }
            .tag-platform { background: var(--glass); padding: 10px 20px; border-radius: 50px; color: white; text-decoration: none; font-size: 0.85rem; font-weight: bold; border: 1px solid rgba(255,255,255,0.2); transition: 0.3s; }
            .tag-platform:hover { transform: scale(1.05); filter: brightness(1.2); }

            @media (max-width: 900px) { .app-container { flex-direction: column; align-items: center; text-align: center; } .poster-aside { position: relative; top: 0; } }
        </style>
    </head>
    <body>
        <div class="bg-blur"></div>
        <div class="app-container">
            <aside class="poster-aside"><img src="${finalImage}"></aside>
            <main class="main-content">
                <div class="nav-group">
                    <form action="/" method="GET" class="search-bar">
                        <input type="text" name="name" placeholder="Encuentra tu anime..." required>
                        <button type="submit" class="btn-search">BUSCAR</button>
                    </form>
                    <button onclick="location.href='/'" style="background:none; border:none; cursor:pointer; font-size:1.5rem;">🎲</button>
                </div>

                <div class="meta-tags">
                    <span>⭐ ${meta.score}</span>
                    <span>${meta.type}</span>
                    <span>${meta.episodes} EPS</span>
                </div>

                <h1>${title}</h1>
                <div class="description">${synopsis || 'Sin descripción disponible.'}</div>

                ${extras.trailer ? `
                    <div class="trailer-wrap">
                        <iframe width="100%" height="100%" src="${extras.trailer}" frameborder="0" allowfullscreen></iframe>
                    </div>
                ` : ''}

                <span class="platform-label">¿DÓNDE VERLO? (ATAJOS)</span>
                <div class="tags-wrapper">${streamingTags}</div>
            </main>
        </div>
    </body>
    </html>
    `;
};

