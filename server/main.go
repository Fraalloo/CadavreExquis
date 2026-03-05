package main

import (
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("File .env non trovato")
	}

	PORT := os.Getenv("SERVER_PORT")
	if PORT == "" {
		PORT = "1773"
	}

	manager := NewRoomManager()

	// Rotta WebSocket
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		ServeWS(manager, w, r)
	})

	log.Printf("Server Go in ascolto sulla porta %s...\n", PORT)
	err := http.ListenAndServe(":"+PORT, nil)
	if err != nil {
		log.Fatal("Errore nell'avvio del server: ", err)
	}
}
