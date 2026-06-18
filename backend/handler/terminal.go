package handler

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"

	"github.com/gorilla/websocket"
)

type resizeMsg struct {
	Cols int `json:"cols"`
	Rows int `json:"rows"`
}

func ShellTerminalWS(w http.ResponseWriter, r *http.Request) {
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("shell ws upgrade error: %v", err)
		return
	}

	cmd := exec.Command("/bin/bash", "-i")
	cmd.Dir = "/home/inu"
	cmd.Env = append(os.Environ(), "TERM=xterm-256color")

	outR, outW := io.Pipe()
	cmd.Stdout = outW
	cmd.Stderr = outW

	inR, inW := io.Pipe()
	cmd.Stdin = inR

	if err := cmd.Start(); err != nil {
		log.Printf("bash start error: %v", err)
		conn.WriteMessage(websocket.TextMessage, []byte("shell start failed: "+err.Error()+"\r\n"))
		conn.Close()
		return
	}

	done := make(chan struct{})

	go func() {
		buf := make([]byte, 4096)
		for {
			n, err := outR.Read(buf)
			if n > 0 {
				if werr := conn.WriteMessage(websocket.TextMessage, buf[:n]); werr != nil {
					break
				}
			}
			if err != nil {
				break
			}
		}
		close(done)
	}()

	go func() {
		for {
			_, msg, err := conn.ReadMessage()
			if err != nil {
				break
			}
			var rs resizeMsg
			if json.Unmarshal(msg, &rs) == nil && rs.Cols > 0 && rs.Rows > 0 {
				continue
			}
			inW.Write(msg)
		}
		inW.Close()
	}()

	cmd.Wait()
	outW.Close()
	conn.Close()
	<-done
}
