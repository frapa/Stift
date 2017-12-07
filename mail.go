package main

import (
	"io"
	"os/exec"
	"time"

	"github.com/rs/xid"
)

func SendEmailShell(from string, to string, subject string, content string) error {
	cmd := exec.Command("mail", to, "-s", subject, "-a", "Content-Type: text/html\nFrom:"+from)
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return err
	}
	io.WriteString(stdin, content)
	stdin.Close()

	_, err = cmd.CombinedOutput()
	if err != nil {
		return err
	}

	return nil
}

func SendEmail(from string, to string, subject string, content string, reason string) error {
	err := SendEmailShell(from, to, subject, content)
	if err != nil {
		return err
	}

	emailId := xid.New().String()

	err = insertInto("Outgoing_Emails", "id, from_address, to_address, subject, content, reason, date",
		emailId, from, to, subject, content, reason, time.Now().Format(time.RFC3339))
	if err != nil {
		return err
	}

	return nil
}
