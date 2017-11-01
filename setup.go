package main

import (
	"crypto/sha1"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"syscall"
	"time"

	"github.com/rs/xid"
	"golang.org/x/crypto/pbkdf2"
)

func Setup(res http.ResponseWriter, req *http.Request) {
	content, err := GetAdminPage("setup")
	if err != nil {
		// Internal Server Error
		http.Error(res, http.StatusText(500), 500)
	} else {
		res.Write(content)
	}
}

func FinalSetup(res http.ResponseWriter, req *http.Request) {
	req.ParseForm()
	email := req.Form.Get("email")
	password := req.Form.Get("password")
	repeat_password := req.Form.Get("repeat_password")
	name := req.Form.Get("name")
	title := req.Form.Get("title")
	subtitle := req.Form.Get("subtitle")

	if password != repeat_password {
		Setup(res, req)
		return
	}

	CreateUser(email, password, name)
	StartSession(res, req, email)

	createSetting("BlogTitle", title)
	createSetting("BlogSubtitle", subtitle)

	// Remove setup file so that next time the server starts in production mode
	os.Remove("setup") // ignore errors

	// Show message and do an html redirect in 4 seconds
	res.Write([]byte(`<!DOCTYPE html><html><head><title>Please wait...</title>
		<meta http-equiv="refresh" content="3;URL=/admin/dashboard"></head>
		<body>Please wait...</body></html>`))

	// Restart in production mode
	go func() {
		time.Sleep(1)
		Restart()
	}()
}

func CreateUser(email string, password string, name string) {
	id := xid.New().String()
	salt := xid.New().String()
	hash := pbkdf2.Key([]byte(password), []byte(salt), 4096, 32, sha1.New)
	slug := strings.Replace(strings.ToLower(name), " ", "-", 100)

	err := insertInto("Users", "id, email, name, slug, password, salt, tags",
		id, email, name, slug, hash, salt, "administrator")
	if err != nil {
		LogError(err.Error())
	}
}

func Restart() {
	// Get executable name
	pname, err := exec.LookPath(os.Args[0])
	if nil != err {
		LogError(err.Error())
		panic(err)
	}
	// Check the executable exists
	if _, err = os.Stat(pname); nil != err {
		LogError(err.Error())
		panic(err)
	}

	// Working directory
	wd, err := os.Getwd()
	if nil != err {
		LogError(err.Error())
		panic(err)
	}

	// Pass files to the new process, so the output continues on the same
	// console.
	files := make([]*os.File, 3)
	files[syscall.Stdin] = os.Stdin
	files[syscall.Stdout] = os.Stdout
	files[syscall.Stderr] = os.Stderr

	_, err = os.StartProcess(pname, os.Args, &os.ProcAttr{
		Dir:   wd,
		Env:   os.Environ(),
		Files: files,
		Sys:   &syscall.SysProcAttr{},
	})
	if nil != err {
		LogError(err.Error())
		panic(err)
	}

	GracefulStop()
}
