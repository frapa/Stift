package main

import (
	"os"
	"os/signal"
	"syscall"
)

var systemSignal chan os.Signal

func main() {
	if _, err := os.Stat("data.sqlite3"); !(os.IsNotExist(err) || justCreated) {
		initFrontend()
	}

	// Catch signals to exit and exit gracefully
	systemSignal = make(chan os.Signal)
	signal.Notify(systemSignal, os.Interrupt, syscall.SIGTERM, syscall.SIGINT)

	go func() {
		<-systemSignal
		GracefulStop()
	}()

	server.ListenAndServe()
}

func GracefulStop() {
	// Log event
	print("\n\n")
	LogInfo("Exiting gracefully.")

	// Wait for server to answer active connections
	server.Shutdown(nil)
	// cleanup database and log file
	db.Close()
	logFile.Close()

	os.Exit(0)
}
