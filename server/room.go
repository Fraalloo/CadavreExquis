package main

import (
	"encoding/json"
	"log"
	"sync"
)

type WSMessage struct {
	Type        string `json:"type"`
	PlayerCount int    `json:"playerCount,omitempty"`
	State       string `json:"state,omitempty"`
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
	Code    string
	Clients map[*Client]bool
	Ready   map[*Client]bool
	State   string // Stati possibili: WAITING, FULL, ROUND_1, ROUND_2, ROUND_3, FINISHED
	mu      sync.Mutex
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
		// TODO: gestione crash e uscita
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
		r.Broadcast(WSMessage{
			Type:  "GAME_START",
			State: r.State,
		})
	}
}
