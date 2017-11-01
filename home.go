package main

import "net/http"

func Home(res http.ResponseWriter, req *http.Request) {
	res.Write([]byte("Ciao"))
}
