package main

import (
	"encoding/json"
	"log"
	"sync"
)

type WSMessage struct {
	Type        string      `json:"type"`
	PlayerCount int         `json:"playerCount,omitempty"`
	State       string      `json:"state,omitempty"`
	Round       int         `json:"round,omitempty"`
	Image       string      `json:"image,omitempty"`
	Papers      [][3]string `json:"papers,omitempty"`
}

// Gestisce tutte le stanze attive in memoria
type RoomManager struct {
	rooms map[string]*Room
	mu    sync.Mutex
}

func NewRoomManager() *RoomManager {
	return &RoomManager{
		rooms: make(map[string]*Room),
	}
}

// Cerca una stanza, se non esiste la crea.
func (m *RoomManager) GetOrCreateRoom(code string) *Room {
	m.mu.Lock()
	defer m.mu.Unlock()

	room, exists := m.rooms[code]
	if !exists {
		log.Printf("Creata nuova stanza: %s\n", code)
		room = &Room{
			Code:    code,
			Clients: make(map[*Client]bool),
			Ready:   make(map[*Client]bool),
			State:   "WAITING",
		}
		m.rooms[code] = room
	}
	return room
}

// Room rappresenta una singola partita
type Room struct {
	Code        string
	Clients     map[*Client]bool
	Ready       map[*Client]bool
	State       string
	mu          sync.Mutex
	Round       int
	Players     []*Client
	Submissions int
	Papers      [][3]string
}

func (r *Room) Broadcast(msg WSMessage) {
	bytes, _ := json.Marshal(msg)
	for client := range r.Clients {
		client.Conn.WriteMessage(1, bytes)
	}
}

func (r *Room) AddClient(c *Client) bool {
	r.mu.Lock()
	defer r.mu.Unlock()

	// Stanza piena
	if len(r.Clients) >= 3 {
		return false
	}

	r.Clients[c] = true
	log.Printf("Giocatore unito alla stanza %s. Totale: %d/3\n", r.Code, len(r.Clients))

	if len(r.Clients) == 3 && r.State == "WAITING" {
		r.State = "FULL"
		log.Printf("Stanza %s piena!", r.Code)
	}

	// Avvisa i client del nuovo arrivato
	r.Broadcast(WSMessage{
		Type:        "STATE_UPDATE",
		PlayerCount: len(r.Clients),
		State:       r.State,
	})

	return true
}

func (r *Room) RemoveClient(c *Client) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, ok := r.Clients[c]; ok {
		delete(r.Clients, c)
		delete(r.Ready, c)

		if r.State == "FULL" && len(r.Clients) < 3 {
			r.State = "WAITING"
		}

		r.Broadcast(WSMessage{
			Type:        "STATE_UPDATE",
			PlayerCount: len(r.Clients),
			State:       r.State,
		})

		log.Printf("Giocatore uscito dalla stanza %s. Totale: %d/3\n", r.Code, len(r.Clients))
		// TODO: GESTIONE CRASH E USCITA
	}
}

func (r *Room) SetPlayerReady(c *Client) {
	r.mu.Lock()
	defer r.mu.Unlock()

	// Pronti solo con stanza FULL
	if r.State != "FULL" {
		return
	}

	r.Ready[c] = true
	log.Printf("Giocatore pronto nella stanza %s (%d/3)", r.Code, len(r.Ready))

	// Inizio round
	if len(r.Ready) == 3 {
		r.State = "ROUND_1"
		r.Round = 1
		r.Submissions = 0

		r.Players = make([]*Client, 0, 3)
		for client := range r.Clients {
			r.Players = append(r.Players, client)
		}

		r.Papers = make([][3]string, 3)

		r.Broadcast(WSMessage{
			Type:  "GAME_START",
			State: r.State,
		})
	}
}

func (r *Room) SubmitDrawing(c *Client, round int, image string) {
	r.mu.Lock()
	defer r.mu.Unlock()

	// 1) Indice del giocatore
	playerIndex := -1
	for i, p := range r.Players {
		if p == c {
			playerIndex = i
			break
		}
	}
	if playerIndex == -1 {
		return
	}

	// 2) Foglio su cui ha disegnato
	paperIndex := (playerIndex + round - 1) % 3
	r.Papers[paperIndex][round-1] = image
	r.Submissions++

	// 3) Controllo dell'invio di tutti i player
	if r.Submissions == 3 {
		r.Submissions = 0

		if r.Round == 3 {
			r.State = "GAME_OVER"
			r.Broadcast(WSMessage{
				Type:   "GAME_OVER",
				Papers: r.Papers,
			})
		} else {
			r.Round++
			r.State = "ROUND_" + string(rune('0'+r.Round))

			// Invio del disegno
			for i, player := range r.Players {
				// Formula per la rotazione dei fogli. Ogni player prende il foglio del player successivo
				nextPaperIndex := (i + r.Round - 1) % 3
				previousImage := r.Papers[nextPaperIndex][r.Round-2]

				msg := WSMessage{
					Type:  "NEXT_ROUND",
					Round: r.Round,
					Image: previousImage,
				}
				bytes, _ := json.Marshal(msg)
				player.Conn.WriteMessage(1, bytes)
			}
		}
	}
}
