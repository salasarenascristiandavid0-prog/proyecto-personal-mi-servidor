const express = require('express');
const axios = require('axios');
const template = require('./template');
const app = express();

const PORT = 3000;

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/', async (req, res) => {
    try {
        const resp = await axios.get('https://api.jikan.moe/v4/top/anime?limit=15');
        const tendencias = resp.data.data;
        const randomHero = tendencias[Math.floor(Math.random() * tendencias.length)];
        res.send(template.renderHome(randomHero, tendencias));
    } catch (e) {
        res.status(500).send("Error al cargar la portada.");
    }
});

app.get('/api/search', async (req, res) => {
    const q = req.query.q;
    if (!q || q.length < 3) return res.json([]);
    try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=6`);
        res.json(response.data.data);
    } catch (e) { res.json([]); }
});

app.get('/search', async (req, res) => {
    const q = req.query.q;
    try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=20`);
        res.send(template.renderSearchResults(q, response.data.data));
    } catch (e) { res.send("Error en la búsqueda."); }
});

app.get('/anime/:id', async (req, res) => {
    try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime/${req.params.id}`);
        const anime = response.data.data;
        const links = [{ name: '⭐ Crunchyroll', url: `https://www.crunchyroll.com/search?q=${encodeURIComponent(anime.title)}` }];
        res.send(template.renderDetail(anime, links));
    } catch (e) { res.send("Error al cargar detalles."); }
});

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

