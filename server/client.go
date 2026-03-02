package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

// HTTP => WebSocket
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// TODO: CONTROLLO CORS
		return true
	},
}

type Client struct {
	Conn *websocket.Conn
	Room *Room
}

// Gestione WebSocket
func ServeWS(manager *RoomManager, w http.ResponseWriter, r *http.Request) {
	roomCode := r.URL.Query().Get("room")
	if roomCode == "" {
		http.Error(w, "Room code mancante", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Errore Upgrade WebSocket:", err)
		return
	}

	room := manager.GetOrCreateRoom(roomCode)

	client := &Client{
		Conn: conn,
		Room: room,
	}

	added := room.AddClient(client)
	if !added {
		client.Conn.WriteMessage(websocket.TextMessage, []byte(`{"error": "Stanza piena"}`))
		client.Conn.Close()
		return
	}

	go client.readMessages()
}

func (c *Client) readMessages() {
	defer func() { // Alla fine della sessione del giocatore
		c.Room.RemoveClient(c)
		c.Conn.Close()
	}()

	for {
		_, messageBytes, err := c.Conn.ReadMessage()
		if err != nil {
			break
		}

		var incoming map[string]any
		if err := json.Unmarshal(messageBytes, &incoming); err == nil {
			msgType, _ := incoming["type"].(string)
			switch msgType {
			case "READY":
				c.Room.SetPlayerReady(c)
			case "SUBMIT_DRAWING":
				roundFloat, _ := incoming["round"].(float64)
				imageStr, _ := incoming["image"].(string)
				c.Room.SubmitDrawing(c, int(roundFloat), imageStr)
			}
			log.Printf("Messaggio [%s] elaborato nella stanza %s\n", msgType, c.Room.Code)
		} else {
			log.Printf("Errore nel parsing del JSON in stanza %s: %v\n", c.Room.Code, err)
		}
	}
}
