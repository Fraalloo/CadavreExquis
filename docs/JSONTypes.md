# Legenda: Tipi di Messaggi WebSocket (JSON)

Questo documento elenca tutti i messaggi JSON scambiati tra il client e il server durante la partita. Il campo `type` viene usato come selettore nello `switch`.
## ⬆️ Dal Client al Server (Richieste)

### `READY`
Inviato quando un giocatore nella lobby clicca sul pulsante "Pronto".
```json
{
  "type": "READY"
}
```

### `SUBMIT_DRAWING`
Inviato alla fine di un round quando un giocatore ha terminato il proprio disegno. L'immagine è inviata come stringa in Base64.
```json
{
  "type": "SUBMIT_DRAWING",
  "round": 1,
  "image": "data:image/png;base64,iVBORw0KGgo..."
}
```

---

## ⬇️ Dal Server al Client (Risposte ed Eventi)

### `STATE_UPDATE`
Inviato in broadcast a tutti i giocatori della stanza quando qualcuno entra, esce o cambia lo stato della lobby.
```json
{
  "type": "STATE_UPDATE",
  "playerCount": 2,
  "state": "WAITING"
}
```

### `GAME_START`
Inviato a tutti quando l'ultimo giocatore preme "Pronto". Indica ai client di passare al Round 1.
```json
{
  "type": "GAME_START"
}
```

### `NEXT_ROUND`
Inviato individualmente a un giocatore quando inizia un nuovo round. Contiene il round attuale e il disegno del round precedente da usare come traccia.
```json
{
  "type": "NEXT_ROUND",
  "round": 2,
  "image": "data:image/png;base64,iVBORw0KGgo..."
}
```

### `GAME_OVER`
Inviato in broadcast a tutti i giocatori quando l'ultimo round è completato. Contiene un array bidimensionale: per ogni foglio, ci sono le 3 immagini (testa, busto, gambe).
```json
{
  "type": "GAME_OVER",
  "papers": [
    ["immagine_testa_1", "immagine_busto_1", "immagine_gambe_1"],
    ["immagine_testa_2", "immagine_busto_2", "immagine_gambe_2"],
    ["immagine_testa_3", "immagine_busto_3", "immagine_gambe_3"]
  ]
}
```
---

## ⚠️ Eccezioni

### Errore di Connessione (Senza campo `type`)
Inviato dal server in caso di eccezioni (es. un quarto giocatore prova ad entrare). Il client lo intercetta verificando l'esistenza della chiave `error`.
```json
{
    "error": "Stanza piena"
}
```