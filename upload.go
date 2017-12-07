package main

import (
	"encoding/json"
	"image/jpeg"
	"image/png"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/nfnt/resize"
)

var maXResolution int
var jpegQuality int

func ReadImageSettings() {
	maXResolutionStr, err := getSetting("MaxResolution")
	if err != nil {
		LogError(err.Error())
		maXResolution = 1920
		return
	}
	maXResolution, err = strconv.Atoi(maXResolutionStr)
	if err != nil {
		LogError(err.Error())
		maXResolution = 1920
	}

	jpegQualityStr, err := getSetting("JpegQuality")
	if err != nil {
		LogError(err.Error())
		jpegQuality = 75
		return
	}
	jpegQuality, err = strconv.Atoi(jpegQualityStr)
	if err != nil {
		LogError(err.Error())
		jpegQuality = 75
	}
}

type File struct {
	Path string
	Size int64
	XRes int64
	YRes int64
}

func Upload(res http.ResponseWriter, req *http.Request) {
	println(1)
	err := req.ParseMultipartForm(32 << 20)
	if err != nil {
		LogError(err.Error())
		http.Error(res, http.StatusText(400), http.StatusBadRequest)
		return
	}

	files := req.MultipartForm.File["files"]

	var jsonFiles []File
	for i, _ := range files {
		file, err := files[i].Open()
		if err != nil {
			LogError(err.Error())
			http.Error(res, http.StatusText(400), http.StatusBadRequest)
			return
		}
		defer file.Close()

		path := filepath.Clean(strings.Replace(req.FormValue("path"), "..", "", -1))
		relPath := filepath.Join(path, files[i].Filename)
		fullPath := filepath.Join("./media/", relPath)

		if _, err := os.Stat(fullPath); os.IsNotExist(err) {
			err := os.MkdirAll(filepath.Dir(fullPath), 0755)
			if err != nil {
				LogError(err.Error())
				http.Error(res, http.StatusText(500), http.StatusInternalServerError)
				return
			}
		}

		// Insert file into database
		// ACTUALLY THIS SHOULD BE DONE FROM JS SIDE
		// In that ways javascript knows immediately of the new file
		// db.Exec("INSERT INTO Media (id, path) VALUES (?, ?)", xid.New().String(), relPath)

		// Create destination file making sure the path is writeable.
		dst, err := os.Create(fullPath)
		if err != nil {
			LogError(err.Error())
			http.Error(res, http.StatusText(500), http.StatusInternalServerError)
			return
		}
		defer dst.Close()

		ext := strings.ToLower(filepath.Ext(files[i].Filename))
		var XRes int64
		var YRes int64
		switch ext {
		case ".png":
			ReadImageSettings()

			// Decode png into image.Image
			img, err := png.Decode(file)
			if err != nil {
				LogError(err.Error())
				http.Error(res, http.StatusText(500), http.StatusInternalServerError)
				return
			}

			// Scale image preserving aspect ratio
			scaledImg := resize.Thumbnail(uint(maXResolution), uint(maXResolution), img, resize.Bilinear)

			rect := scaledImg.Bounds()
			XRes = int64(rect.Max.X - rect.Min.X)
			YRes = int64(rect.Max.Y - rect.Min.Y)

			// Write new image to file
			png.Encode(dst, scaledImg)
		case ".jpg", ".jpeg":
			ReadImageSettings()

			// Decode jpeg into image.Image
			img, err := jpeg.Decode(file)
			if err != nil {
				LogError(err.Error())
				http.Error(res, http.StatusText(500), http.StatusInternalServerError)
				return
			}

			// Scale image preserving aspect ratio
			scaledImg := resize.Thumbnail(uint(maXResolution), uint(maXResolution), img, resize.Bilinear)

			rect := scaledImg.Bounds()
			XRes = int64(rect.Max.X - rect.Min.X)
			YRes = int64(rect.Max.Y - rect.Min.Y)

			// Write new image to file
			jpeg.Encode(dst, scaledImg, &jpeg.Options{jpegQuality})
		default:
			// Copy the uploaded file to the destination file
			if _, err := io.Copy(dst, file); err != nil {
				LogError(err.Error())
				http.Error(res, http.StatusText(500), http.StatusInternalServerError)
				return
			}
		}

		stats, err := os.Stat(fullPath)
		if err != nil {
			LogError(err.Error())
			http.Error(res, http.StatusText(500), http.StatusInternalServerError)
			return
		}

		var jsonFile File
		jsonFile.Path = strings.Replace(relPath, "\"", "\\\"", -1)
		jsonFile.Size = stats.Size()
		jsonFile.XRes = XRes
		jsonFile.YRes = YRes

		jsonFiles = append(jsonFiles, jsonFile)
	}

	data, err := json.Marshal(jsonFiles)
	if err != nil {
		LogError(err.Error())
		http.Error(res, http.StatusText(500), http.StatusInternalServerError)
		return
	}

	res.Write([]byte(data))
}
