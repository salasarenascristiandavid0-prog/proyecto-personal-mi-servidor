const express = require('express');
const axios = require('axios');
const template = require('./template');
const app = express();

const PORT = 3000;

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/', async (req, res) => {
    const animeName = req.query.name;

    if (animeName) {
        try {
            const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(animeName)}&limit=1`);
            const anime = response.data.data[0];

            if (anime) {
                // INYECCIÓN DE CRUNCHYROLL: Creamos el link de búsqueda automática
                const crunchyrollLink = { 
                    name: '⭐ Crunchyroll (Recomendado)', 
                    url: `https://www.crunchyroll.com/search?q=${encodeURIComponent(anime.title)}` 
                };

                // Combinamos con los links que traiga la API
                let otherLinks = [];
                if (anime.external) otherLinks = [...anime.external];
                if (anime.streaming) otherLinks = [...otherLinks, ...anime.streaming];

                // El link de Crunchyroll siempre va primero
                const finalLinks = [crunchyrollLink, ...otherLinks];

                return res.send(template(
                    anime.title, 
                    anime.images.jpg.large_image_url, 
                    anime.mal_id, 
                    anime.synopsis,
                    "BÚSQUEDA",
                    { score: anime.score || "N/A", episodes: anime.episodes || "?", type: anime.type || "TV" },
                    { trailer: anime.trailer.embed_url, external: finalLinks }
                ));
            }
            return res.send(template("No encontrado", null, "404", "No hay registros.", "ERROR"));
        } catch (error) {
            return res.send(template("Error", null, "500", "Error de conexión.", "ERROR"));
        }
    }

    // Sugerencia Aleatoria al entrar
    try {
        const response = await axios.get('https://api.jikan.moe/v4/random/anime');
        const anime = response.data.data;
        
        const crunchyrollLink = { 
            name: '⭐ Crunchyroll (Recomendado)', 
            url: `https://www.crunchyroll.com/search?q=${encodeURIComponent(anime.title)}` 
        };

        return res.send(template(
            `✨ Sugerencia: ${anime.title}`, 
            anime.images.jpg.large_image_url, 
            anime.mal_id, 
            anime.synopsis,
            "ALEATORIO",
            { score: anime.score || "N/A", episodes: anime.episodes || "?", type: anime.type || "TV" },
            { trailer: anime.trailer.embed_url, external: [crunchyrollLink, ...(anime.external || [])] }
        ));
    } catch (error) {
        return res.send(template("Bienvenido", null, "000", "Busca un anime.", "BÚSQUEDA"));
    }
});

app.listen(PORT, () => {
    console.log(`--- SERVIDOR ANIME-HUB ONLINE (Modo Atajos) ---`);
});

