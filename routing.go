package main

import (
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gorilla/context"
	"github.com/gorilla/mux"
)

var router *mux.Router
var server *http.Server

func init() {
	router = mux.NewRouter()

	if _, err := os.Stat("data.sqlite3"); os.IsNotExist(err) {
		// setup page (only first time)
		router.HandleFunc("/setup", FinalSetup)
		router.PathPrefix("/").HandlerFunc(Setup)
	} else {
		router.HandleFunc("/", Home)

		// Admin pages
		router.HandleFunc("/admin", Admin)
		router.HandleFunc("/admin/", Admin)
		router.HandleFunc("/admin/{page}", Admin)
		router.HandleFunc("/admin/{page}/", Admin)

		// Admin static files
		jsStatic := filepath.Join("content", "admin", "js")
		cssStatic := filepath.Join("content", "admin", "css")
		fontsStatic := filepath.Join("content", "admin", "fonts")
		router.PathPrefix("/admin/js/").Handler(
			http.StripPrefix("/admin/js/", http.FileServer(http.Dir(jsStatic))))
		router.PathPrefix("/admin/css/").Handler(
			http.StripPrefix("/admin/css/", http.FileServer(http.Dir(cssStatic))))
		router.PathPrefix("/admin/fonts/").Handler(
			http.StripPrefix("/admin/fonts/", http.FileServer(http.Dir(fontsStatic))))
	}

	http.Handle("/", router)

	server = &http.Server{
		Addr:              ":8080",
		Handler:           context.ClearHandler(http.DefaultServeMux),
		ReadTimeout:       15 * time.Second,
		ReadHeaderTimeout: 5 * time.Second,
		WriteTimeout:      15 * time.Second,
		MaxHeaderBytes:    1024 * 1024, // 1 MB
	}
}
