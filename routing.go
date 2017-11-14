package main

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gorilla/context"
	"github.com/gorilla/mux"
)

var router *mux.Router
var server *http.Server
var theme string

func init() {
	router = mux.NewRouter()

	if _, err := os.Stat("data.sqlite3"); os.IsNotExist(err) || justCreated {
		// setup page (only first time)
		router.HandleFunc("/setup", FinalSetup)
		router.PathPrefix("/").HandlerFunc(Setup)
	} else {
		router.HandleFunc("/", Home)
		router.HandleFunc("/", Home).Queries("page", "{page}")
		router.HandleFunc("/tag/{slug}", TagPage)
		router.HandleFunc("/author/{slug}", AuthorPage)
		router.HandleFunc("/{year:[0-9]+}/{month:[0-9]+}/{day:[0-9]+}/{slug}", PostPage)
		router.HandleFunc("/search", Search).Queries("terms", "{terms}")
		router.HandleFunc("/search", Search).Queries("terms", "{terms}").Queries("page", "{page}")
		router.HandleFunc("/page/{slug}", PagePage)

		// Admin pages
		router.HandleFunc("/admin", Admin)
		router.HandleFunc("/admin/{page}", Admin)

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

func initThemeRoutes() {
	themeId, err := getSetting("Theme")
	if err != nil {
		LogError(err.Error())
		panic(err)
	}
	themeSlice, err := getColumnsWhere("Themes", "Name", "id=?", themeId)
	if err != nil {
		LogError(err.Error())
		panic(err)
	}
	theme = strings.Replace(strings.ToLower(themeSlice[0]), " ", "_", -1)

	// Theme static files
	jsTheme := filepath.Join("content", "themes", theme, "js")
	if _, err := os.Stat(jsTheme); err == nil {
		router.PathPrefix("/js/").Handler(
			http.StripPrefix("/js/", http.FileServer(http.Dir(jsTheme))))
	}
	cssTheme := filepath.Join("content", "themes", theme, "css")
	if _, err := os.Stat(cssTheme); err == nil {
		router.PathPrefix("/css/").Handler(
			http.StripPrefix("/css/", http.FileServer(http.Dir(cssTheme))))
	}
	fontsTheme := filepath.Join("content", "themes", theme, "fonts")
	if _, err := os.Stat(fontsTheme); err == nil {
		router.PathPrefix("/fonts/").Handler(
			http.StripPrefix("/fonts/", http.FileServer(http.Dir(fontsTheme))))
	}
	mediaTheme := filepath.Join("content", "themes", theme, "media")
	if _, err := os.Stat(mediaTheme); err == nil {
		router.PathPrefix("/media/").Handler(
			http.StripPrefix("/media/", http.FileServer(http.Dir(mediaTheme))))
	}
}
