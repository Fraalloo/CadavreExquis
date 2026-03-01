package main

import (
	"log"
	"net/http"
)

func main() {
	manager := NewRoomManager()

	// Rotta WebSocket
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		ServeWS(manager, w, r)
	})

	log.Println("Server Go in ascolto sulla porta 1775...")
	err := http.ListenAndServe(":1775", nil)
	if err != nil {
		log.Fatal("Errore nell'avvio del server: ", err)
	}
}
