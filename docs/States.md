# Legenda: Stati della Stanza

Questo documento descrive i vari stati in cui può trovarsi una stanza durante il ciclo di vita di una partita/room a *Cadavre Exquis*. Lo stato è gestito sia dal Server (Go) che dal Client (React).

## 🛋️ Stati della Lobby
- **`WAITING`**: La stanza è attiva ma ha meno di 3 giocatori. I presenti sono in attesa.
- **`FULL`**: La stanza ha raggiunto il limite massimo (3 giocatori). Nessun altro può entrare. Si attende che tutti i presenti confermino di essere pronti.

## 🎨 Stati di Gioco
- **`ROUND_1`**: Il gioco è iniziato. Tutti i giocatori stanno disegnando **La Testa**. Nessun indizio visivo viene mostrato sul Canvas.
- **`ROUND_2`**: Tutti hanno consegnato la testa. I giocatori stanno disegnando **Il Busto**. Sulla parte superiore del Canvas viene mostrata una porzione sfumata del disegno del turno precedente per permettere il raccordo.
- **`ROUND_3`**: Tutti hanno consegnato il busto. I giocatori stanno disegnando **Le Gambe**. Sulla parte superiore del Canvas compare il raccordo del busto precedente.

## ✨ Fine Partita
- **`GAME_OVER`**: Tutti i turni sono terminati. Il server ha incrociato i fogli e invia i risultati. Il gioco mostra a tutti la galleria finale con i 3 capolavori uniti tramite sovrapposizione grafica.

---
*Nota sul Frontend:* In React esiste anche uno stato locale iniziale **`HOME`**. Questo stato indica semplicemente che l'utente si trova nella schermata iniziale e non ha ancora aperto nessuna connessione WebSocket.