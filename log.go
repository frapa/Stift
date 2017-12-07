package main

import (
	"fmt"
	"os"
	"runtime/debug"
	"time"
)

var logFile *os.File

func init() {
	var err error

	if _, err = os.Stat("ublop.log"); os.IsNotExist(err) {
		logFile, err = os.Create("ublop.log")
		if err != nil {
			panic(err)
		}
	} else {
		logFile, err = os.OpenFile("ublop.log", os.O_APPEND|os.O_WRONLY, 0644)
		if err != nil {
			panic(err)
		}
	}
}

func Log(level string, message string) {
	now := time.Now().Format("02-01-2006 15:04:05")
	completeMessage := now + " [" + level + "] " + message + "\n"

	_, err := logFile.Write([]byte(completeMessage))
	if err != nil {
		println(err.Error())
	}
	logFile.Sync()
	fmt.Print(completeMessage)
}

func LogInfo(message string) {
	Log("INFO", message)
}

func LogError(message string) {
	stack := string(debug.Stack())
	Log("ERROR", message+"\n"+stack)
}
