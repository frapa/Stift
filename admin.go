package main

import (
	"bytes"
	"crypto/sha1"
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"
	"unicode"

	"github.com/gorilla/mux"
	"github.com/rs/xid"
	"golang.org/x/crypto/pbkdf2"
)

const (
	SESSION_LENGTH = 6 * time.Hour
)

type Session struct {
	Email  string
	Expiry time.Time
	Ip     string
}

// TODO: persist session across server restarts
var sessions map[string]Session
var actions map[string]func(res http.ResponseWriter, req *http.Request)
var emailRegexp *regexp.Regexp

func init() {
	sessions = make(map[string]Session)
	actions = make(map[string]func(http.ResponseWriter, *http.Request))
	emailRegexp = regexp.MustCompile("^\\S+@\\S+.\\w+$")

	actions["login"] = Login
	actions["dashboard"] = Dashboard
	actions["editor"] = Dashboard
	actions["team"] = Dashboard
	actions["tags"] = Dashboard
	actions["subscribers"] = Dashboard
	actions["media"] = Dashboard
	actions["blog-settings"] = Dashboard
	actions["user-settings"] = Dashboard
	actions["get-elems"] = GetElems
	actions["set-elems"] = SetElems
	actions["del-elems"] = DelElems
	actions["get-authors-and-tags"] = GetAuthorsAndTags
	actions["upload"] = Upload
	actions["email"] = Email
	actions["password"] = Password
	actions["invite-member"] = InviteMember
}

func IsAuthenticated(req *http.Request) bool {
	cookie, _ := req.Cookie("ublop")

	// cookie must exists ...
	if cookie != nil {
		// ... contain existing session id ...
		if session, ok := sessions[cookie.Value]; ok {
			now := time.Now()
			// ... and be an unexpired session id ...
			if !now.After(session.Expiry) {
				ip := strings.Split(req.RemoteAddr, ":")[0]
				// ... and the ip should be that of the auth request.
				if ip == session.Ip {
					return true
				}
			} else {
				// If too old, remove the session
				delete(sessions, cookie.Value)
			}
		}
	}

	return false
}

func Authenticate(email string, password string) bool {
	cols, err := getColumnsWhere("Users", "password,salt", "email=?", email)
	if err != nil {
		LogError(err.Error())
		return false
	}
	db_hash := cols[0]
	salt := cols[1]

	hash := pbkdf2.Key([]byte(password), []byte(salt), 4096, 32, sha1.New)
	if db_hash == string(hash) {
		return true
	}

	return false
}

func StartSession(res http.ResponseWriter, req *http.Request, email string) {
	sessionId := xid.New().String()

	// Save session id
	sessions[sessionId] = Session{
		email,
		time.Now().Add(SESSION_LENGTH),
		strings.Split(req.RemoteAddr, ":")[0]}

	// Set cookie
	expiration := time.Now().Add(24 * time.Hour)
	cookie := http.Cookie{Name: "ublop", Value: sessionId, Expires: expiration}
	http.SetCookie(res, &cookie)
}

func Admin(res http.ResponseWriter, req *http.Request) {
	vars := mux.Vars(req)
	page := vars["page"]

	if page == "" {
		page = "dashboard"
	}

	if !IsAuthenticated(req) && page != "login" {
		http.Redirect(res, req, "/admin/login", http.StatusFound)
		return
	}

	action := actions[page]

	if action != nil {
		action(res, req)
	} else {
		http.Error(res, http.StatusText(404), 404)
	}
}

func GetAdminPage(name string) ([]byte, error) {
	path := filepath.Join("content", "admin", "pages", name+".html")
	content, err := ioutil.ReadFile(path)
	if err != nil {
		LogError("Admin page '" + name + "' was not found.")
		return []byte{}, errors.New("File not found")
	}

	return content, nil
}

func Login(res http.ResponseWriter, req *http.Request) {
	req.ParseForm()
	email := req.Form.Get("email")
	password := req.Form.Get("password")

	failed := false
	if len(email) != 0 && len(password) != 0 {
		if Authenticate(email, password) {
			StartSession(res, req, email)
			http.Redirect(res, req, "/admin/dashboard", http.StatusFound)
		} else {
			failed = true
		}
	}

	content, err := GetAdminPage("login")
	if err != nil {
		// Internal Server Error
		http.Error(res, http.StatusText(500), 500)
	} else {
		if failed {
			content = bytes.Replace(content, []byte("none"), []byte("auto"), 1)
			content = bytes.Replace(content, []byte("rgb(25, 118, 210)"), []byte("rgb(255, 82, 82)"), 1)
		}

		res.Write(content)
	}
}

func Dashboard(res http.ResponseWriter, req *http.Request) {
	content, err := GetAdminPage("dashboard")
	if err != nil {
		http.Error(res, http.StatusText(500), http.StatusInternalServerError)
	} else {
		cookie, _ := req.Cookie("ublop")
		session := sessions[cookie.Value]
		content := strings.Replace(string(content), "%email%", session.Email, 1)
		res.Write([]byte(content))
	}
}

type Filter struct {
	Field    string
	Operator string
	Value    string
}

type Order struct {
	Field     string
	Direction string
}

type Select struct {
	Table   string
	Filters []Filter
	Order   Order
	Limit   int
	Offset  int
}

func IsLetter(s string) bool {
	for _, r := range s {
		if !unicode.IsLetter(r) && r != '_' && r != '2' {
			return false
		}
	}
	return true
}

func IsOperator(s string) bool {
	switch strings.ToLower(s) {
	case "=", "!=", "<", "<=", ">", ">=", "like":
		return true
	}

	return false
}

func GetElems(res http.ResponseWriter, req *http.Request) {
	data, err := ioutil.ReadAll(req.Body)
	if err != nil {
		http.Error(res, http.StatusText(400), http.StatusBadRequest)
		return
	}

	var sel Select
	err = json.Unmarshal(data, &sel)
	if err != nil {
		http.Error(res, http.StatusText(400), http.StatusBadRequest)
		return
	}

	// Check data to avoid SQL injection
	if !IsLetter(sel.Table) {
		LogError("Table name does contains invalid charachters")
		http.Error(res, http.StatusText(400), http.StatusBadRequest)
		return
	}

	// Create query
	args := make([]interface{}, 0)
	query := "SELECT * FROM \"" + sel.Table + "\""

	if len(sel.Filters) > 0 {
		query += " WHERE "

		filtersSql := make([]string, 0)
		for _, filter := range sel.Filters {
			if !IsLetter(filter.Field) {
				LogError("Field name does contains invalid charachters")
				http.Error(res, http.StatusText(400), http.StatusBadRequest)
				return
			}

			if !IsOperator(filter.Operator) {
				LogError("Operator is invalid")
				http.Error(res, http.StatusText(400), http.StatusBadRequest)
				return
			}

			filtersSql = append(filtersSql, "\""+filter.Field+"\" "+filter.Operator+" ?")
			args = append(args, filter.Value)
		}

		query += strings.Join(filtersSql, " AND ")
	}

	if sel.Order != (Order{}) {
		// Check data to avoid SQL injection
		if !IsLetter(sel.Order.Field) {
			LogError("Field '" + sel.Order.Field +
				"' name does contains invalid charachters")
			http.Error(res, http.StatusText(400), http.StatusBadRequest)
			return
		}

		if sel.Order.Direction != "ASC" || sel.Order.Direction != "DESC" {
			http.Error(res, http.StatusText(400), http.StatusBadRequest)
			return
		}

		query += " ORDER BY ? " + sel.Order.Direction
		args = append(args, sel.Order.Field)
	}

	if sel.Limit >= 0 {
		query += " LIMIT " + strconv.Itoa(sel.Limit)

		if sel.Offset >= 0 {
			query += " OFFSET " + strconv.Itoa(sel.Offset)
		}
	}

	// Execute query
	rows, err := db.Queryx(query, args...)
	if err != nil {
		LogError(err.Error())
		http.Error(res, http.StatusText(500), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var responseJson []byte
	switch sel.Table {
	case "Users":
		rowsData := make([]User, 0)

		for rows.Next() {
			rowData := new(User)
			err := rows.StructScan(&rowData)
			if err != nil {
				LogError(err.Error())
				http.Error(res, http.StatusText(500), http.StatusInternalServerError)
				return
			}
			// Do now allow password to go over the network
			rowData.Password.String = ""
			rowData.Salt.String = ""
			rowsData = append(rowsData, *rowData)
		}

		responseJson, err = json.Marshal(rowsData)
	case "Posts":
		rowsData := make([]Post, 0)

		for rows.Next() {
			rowData := new(Post)
			err := rows.StructScan(&rowData)
			if err != nil {
				LogError(err.Error())
				http.Error(res, http.StatusText(500), http.StatusInternalServerError)
				return
			}
			rowsData = append(rowsData, *rowData)
		}

		responseJson, err = json.Marshal(rowsData)
	case "Settings":
		rowsData := make([]Settings, 0)

		for rows.Next() {
			rowData := new(Settings)
			err := rows.StructScan(&rowData)
			if err != nil {
				LogError(err.Error())
				http.Error(res, http.StatusText(500), http.StatusInternalServerError)
				return
			}
			rowsData = append(rowsData, *rowData)
		}

		responseJson, err = json.Marshal(rowsData)
	case "Tags":
		rowsData := make([]Tag, 0)

		for rows.Next() {
			rowData := new(Tag)
			err := rows.StructScan(&rowData)
			if err != nil {
				LogError(err.Error())
				http.Error(res, http.StatusText(500), http.StatusInternalServerError)
				return
			}
			rowsData = append(rowsData, *rowData)
		}

		responseJson, err = json.Marshal(rowsData)
	case "Subscribers":
		rowsData := make([]Subscriber, 0)

		for rows.Next() {
			rowData := new(Subscriber)
			err := rows.StructScan(&rowData)
			if err != nil {
				LogError(err.Error())
				http.Error(res, http.StatusText(500), http.StatusInternalServerError)
				return
			}
			rowsData = append(rowsData, *rowData)
		}

		responseJson, err = json.Marshal(rowsData)
	case "Themes":
		rowsData := make([]Theme, 0)

		for rows.Next() {
			rowData := new(Theme)
			err := rows.StructScan(&rowData)
			if err != nil {
				LogError(err.Error())
				http.Error(res, http.StatusText(500), http.StatusInternalServerError)
				return
			}
			rowsData = append(rowsData, *rowData)
		}

		responseJson, err = json.Marshal(rowsData)
	case "Media":
		rowsData := make([]Media, 0)

		for rows.Next() {
			rowData := new(Media)
			err := rows.StructScan(&rowData)
			if err != nil {
				LogError(err.Error())
				http.Error(res, http.StatusText(500), http.StatusInternalServerError)
				return
			}
			rowsData = append(rowsData, *rowData)
		}

		responseJson, err = json.Marshal(rowsData)
	case "Post2Users":
		rowsData := make([]Post2Users, 0)

		for rows.Next() {
			rowData := new(Post2Users)
			err := rows.StructScan(&rowData)
			if err != nil {
				LogError(err.Error())
				http.Error(res, http.StatusText(500), http.StatusInternalServerError)
				return
			}
			rowsData = append(rowsData, *rowData)
		}

		responseJson, err = json.Marshal(rowsData)
	case "Post2Tags":
		rowsData := make([]Post2Tags, 0)

		for rows.Next() {
			rowData := new(Post2Tags)
			err := rows.StructScan(&rowData)
			if err != nil {
				LogError(err.Error())
				http.Error(res, http.StatusText(500), http.StatusInternalServerError)
				return
			}
			rowsData = append(rowsData, *rowData)
		}

		responseJson, err = json.Marshal(rowsData)
	}

	if err != nil {
		LogError(err.Error())
		http.Error(res, http.StatusText(500), http.StatusInternalServerError)
		return
	}

	res.Write(responseJson)
}

type SaveReq struct {
	Table string
	Data  []map[string]interface{}
	New   bool
}

func SetElems(res http.ResponseWriter, req *http.Request) {
	data, err := ioutil.ReadAll(req.Body)
	if err != nil {
		http.Error(res, http.StatusText(400), http.StatusBadRequest)
		return
	}

	var saveReq SaveReq
	err = json.Unmarshal(data, &saveReq)
	if err != nil {
		LogError("Invalid JSON")
		http.Error(res, http.StatusText(400), http.StatusBadRequest)
		return
	}

	// Check data to avoid SQL injection
	if !IsLetter(saveReq.Table) {
		LogError("Table name does contains invalid charachters")
		http.Error(res, http.StatusText(400), http.StatusBadRequest)
		return
	}

	id := ""
	if saveReq.New {
		id, err = CreateElem(saveReq)
	} else {
		err = UpdateElems(saveReq)
	}

	if err != nil {
		LogError(err.Error())
		http.Error(res, http.StatusText(400), http.StatusBadRequest)
		return
	}

	res.Write([]byte(`{"id": "` + id + `"}`))
}

func CreateElem(saveReq SaveReq) (string, error) {
	// Check there is at least one element in the Data slice
	if len(saveReq.Data) == 0 {
		return "", errors.New("No data provided")
	}

	sql := "INSERT INTO \"" + saveReq.Table + "\""

	fields := make([]string, 1)
	valuesQuestion := make([]string, 1)
	values := make([]interface{}, 1)

	newId := xid.New().String()
	fields[0] = "id"
	valuesQuestion[0] = "?"
	values[0] = newId

	for field, value := range saveReq.Data[0] {
		if strings.ToLower(field) == "id" {
			continue
		}

		if !IsLetter(field) {
			msg := "Field name probably contains SQL: " + field
			LogError(msg)
			return "", errors.New(msg)
		}

		fields = append(fields, "\""+field+"\"")
		valuesQuestion = append(valuesQuestion, "?")
		values = append(values, value)
	}

	joinedFields := strings.Join(fields, ", ")
	joinedValues := strings.Join(valuesQuestion, ", ")
	sql += " (" + joinedFields + ") VALUES (" + joinedValues + ")"

	_, err := db.Exec(sql, values...)
	if err != nil {
		LogError(err.Error())
		return "", errors.New("SQL Error")
	}

	return newId, nil
}

func UpdateElems(saveReq SaveReq) error {
	sql := ""

	values := make([]interface{}, 0)
	for _, record := range saveReq.Data {
		if _, ok := record["Id"]; !ok {
			return errors.New("No Id was found in the data to be saved.")
		}

		sqlInsert := "UPDATE \"" + saveReq.Table + "\""

		fields := make([]string, 0)
		for field, value := range record {
			if strings.ToLower(field) == "id" || strings.ToLower(field) == "password" || strings.ToLower(field) == "salt" {
				continue
			}

			if !IsLetter(field) {
				msg := "Field name probably contains SQL: " + field
				LogError(msg)
				return errors.New(msg)
			}

			fields = append(fields, "\""+field+"\"=?")
			values = append(values, value)
		}

		values = append(values, record["Id"])
		joinedFields := strings.Join(fields, ", ")
		sqlInsert += " SET " + joinedFields + " WHERE id=?;"

		sql += sqlInsert
	}

	sql = "BEGIN TRANSACTION;" + sql + "END TRANSACTION;"

	_, err := db.Exec(sql, values...)
	if err != nil {
		// Othewise one has to start the server anew
		db.Exec("ROLLBACK;")
		LogError(err.Error())
		return errors.New("SQL Error")
	}

	return nil
}

type DeleteReq struct {
	Table string
	Data  []map[string]interface{}
	New   bool
}

func DelElems(res http.ResponseWriter, req *http.Request) {
	data, err := ioutil.ReadAll(req.Body)
	if err != nil {
		http.Error(res, http.StatusText(400), http.StatusBadRequest)
		return
	}

	var delReq DeleteReq
	err = json.Unmarshal(data, &delReq)
	if err != nil {
		LogError("Invalid JSON")
		http.Error(res, http.StatusText(400), http.StatusBadRequest)
		return
	}

	// Check data to avoid SQL injection
	if !IsLetter(delReq.Table) {
		LogError("Table name does contains invalid charachters")
		http.Error(res, http.StatusText(400), http.StatusBadRequest)
		return
	}

	sql := ""

	values := make([]interface{}, 0)
	for _, record := range delReq.Data {
		if _, ok := record["Id"]; !ok {
			LogError("No Id was found in the data to be deleted.")
			http.Error(res, http.StatusText(400), http.StatusBadRequest)
		}

		sql += "DELETE FROM \"" + delReq.Table + "\" WHERE Id=?;"
		values = append(values, record["Id"])
	}

	sql = "BEGIN TRANSACTION;" + sql + "END TRANSACTION;"

	_, err = db.Exec(sql, values...)
	if err != nil {
		// Othewise one has to start the server anew
		db.Exec("ROLLBACK;")
		LogError(err.Error())
		http.Error(res, http.StatusText(500), http.StatusInternalServerError)
	}

	res.Write([]byte("{}"))
}

type AuthorsAndTagsReq struct {
	Post string
}

type UserLink struct {
	User
	LinkId string
}

type TagLink struct {
	Tag
	LinkId string
}

type AuthorsAndTags struct {
	Authors []UserLink
	Tags    []TagLink
}

func getAuthors(postId string) ([]UserLink, error) {
	authorsSql := `
		SELECT Post2Users.Id AS linkid, Users.* FROM Post2Users
		JOIN Users ON Post2Users.User=Users.Id
		WHERE Post2Users.Post=? ORDER BY Users.Name ASC;`

	// Execute query
	rows, err := db.Queryx(authorsSql, postId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	authors := make([]UserLink, 0)

	for rows.Next() {
		rowData := new(UserLink)
		err := rows.StructScan(&rowData)
		if err != nil {
			return nil, err
		}
		// Do now allow password to go over the network
		rowData.Password.String = ""
		rowData.Salt.String = ""
		authors = append(authors, *rowData)
	}

	return authors, nil
}

func getTags(postId string) ([]TagLink, error) {
	tagsSql := `
		SELECT Post2Tags.Id AS linkid, Tags.* FROM Post2Tags
		JOIN Tags ON Post2Tags.Tag=Tags.Id
		WHERE Post2Tags.Post=? ORDER BY Tags.Name ASC;`

	// Execute query
	rows, err := db.Queryx(tagsSql, postId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tags := make([]TagLink, 0)

	for rows.Next() {
		rowData := new(TagLink)
		err := rows.StructScan(&rowData)
		if err != nil {
			return nil, err
		}
		tags = append(tags, *rowData)
	}

	return tags, nil
}

func GetAuthorsAndTags(res http.ResponseWriter, req *http.Request) {
	reqDataStr, err := ioutil.ReadAll(req.Body)
	if err != nil {
		LogError(err.Error())
		http.Error(res, http.StatusText(400), http.StatusBadRequest)
		return
	}

	var reqData AuthorsAndTagsReq
	err = json.Unmarshal(reqDataStr, &reqData)
	if err != nil {
		LogError("Invalid JSON")
		http.Error(res, http.StatusText(400), http.StatusBadRequest)
		return
	}
	postId := reqData.Post

	data := new(AuthorsAndTags)
	data.Authors, err = getAuthors(postId)
	if err != nil {
		LogError(err.Error())
		http.Error(res, http.StatusText(500), http.StatusInternalServerError)
		return
	}
	data.Tags, err = getTags(postId)
	if err != nil {
		LogError(err.Error())
		http.Error(res, http.StatusText(500), http.StatusInternalServerError)
		return
	}

	responseJson, err := json.Marshal(data)

	if err != nil {
		LogError(err.Error())
		http.Error(res, http.StatusText(500), http.StatusInternalServerError)
		return
	}

	res.Write(responseJson)
}

type EmailData struct {
	From    string
	To      string
	Subject string
	Content string
	Reason  string
}

func IsEmail(email string) bool {
	return emailRegexp.MatchString(email)
}

func Email(res http.ResponseWriter, req *http.Request) {
	reqDataStr, err := ioutil.ReadAll(req.Body)
	if err != nil {
		LogError(err.Error())
		http.Error(res, http.StatusText(400), http.StatusBadRequest)
		return
	}

	var emailData EmailData
	err = json.Unmarshal(reqDataStr, &emailData)
	if err != nil {
		LogError("Invalid JSON")
		http.Error(res, http.StatusText(400), http.StatusBadRequest)
		return
	}

	if !IsEmail(emailData.From) {
		res.Write([]byte("Invalid 'from' address"))
		return
	}

	if !IsEmail(emailData.To) {
		res.Write([]byte("Invalid 'to' address"))
		return
	}

	err = SendEmail(emailData.From, emailData.To, emailData.Subject, emailData.Content, emailData.Reason)
	if err != nil {
		LogError(err.Error())
		res.Write([]byte("'mail' is not installed"))
		return
	}

	res.Write([]byte("Ok"))
}

type PasswordData struct {
	Password string
}

func Password(res http.ResponseWriter, req *http.Request) {
	reqDataStr, err := ioutil.ReadAll(req.Body)
	if err != nil {
		LogError(err.Error())
		http.Error(res, http.StatusText(400), http.StatusBadRequest)
		return
	}

	var passwordData PasswordData
	err = json.Unmarshal(reqDataStr, &passwordData)
	if err != nil {
		LogError("Invalid JSON")
		http.Error(res, http.StatusText(400), http.StatusBadRequest)
		return
	}

	// Get user
	cookie, _ := req.Cookie("ublop")

	// cookie must exists ...
	if cookie != nil {
		// ... contain existing session id ...
		if session, ok := sessions[cookie.Value]; ok {
			email := session.Email

			err := SetUserPassword(email, passwordData.Password)
			if err != nil {
				LogError(err.Error())
				http.Error(res, http.StatusText(500), http.StatusInternalServerError)
				return
			}

			res.Write([]byte("Ok"))
			return
		}
	}

	res.Write([]byte("Error"))
}

type InviteData struct {
	Email string
}

func InviteMember(res http.ResponseWriter, req *http.Request) {
	reqDataStr, err := ioutil.ReadAll(req.Body)
	if err != nil {
		LogError(err.Error())
		http.Error(res, http.StatusText(400), http.StatusBadRequest)
		return
	}

	var inviteData InviteData
	err = json.Unmarshal(reqDataStr, &inviteData)
	if err != nil {
		LogError("Invalid JSON")
		http.Error(res, http.StatusText(400), http.StatusBadRequest)
		return
	}

	// Get data about current user
	cookie, _ := req.Cookie("ublop")

	// cookie must exists ...
	sendingUserName := ""
	if cookie != nil {
		// ... contain existing session id ...
		if session, ok := sessions[cookie.Value]; ok {
			sendingUserEmail := session.Email

			data, err := getColumnsWhere("Users", "name", "email=?", sendingUserEmail)
			if err != nil {
				LogError(err.Error())
				http.Error(res, http.StatusText(500), http.StatusInternalServerError)
				return
			}
			sendingUserName = data[0]
		}
	}

	// Set random password
	randomPassword := xid.New().String()

	err = SetUserPassword(inviteData.Email, randomPassword)
	if err != nil {
		LogError(err.Error())
		http.Error(res, http.StatusText(400), http.StatusBadRequest)
		return
	}

	// Now send emails containing login data
	blogTitle, err := getSetting("BlogTitle")
	if err != nil {
		LogError(err.Error())
		http.Error(res, http.StatusText(500), http.StatusInternalServerError)
		return
	}
	blogUrl, err := getSetting("BlogUrl")
	if err != nil {
		LogError(err.Error())
		http.Error(res, http.StatusText(500), http.StatusInternalServerError)
		return
	}
	fromAddress, err := getSetting("OutgoingEmailAddress")
	if err != nil {
		LogError(err.Error())
		http.Error(res, http.StatusText(500), http.StatusInternalServerError)
		return
	}
	blogLogin := blogUrl + "/admin"

	SendEmail(fromAddress, inviteData.Email,
		"Invitation to edit "+blogTitle,
		"<p>"+sendingUserName+" is inviting you to be coauthor of the blog <a href=\""+
			blogUrl+"\">"+blogTitle+"</a>.</p><p>This is your login data for the admin interface:</p>"+
			"<ul><li>Admin login: <a href=\""+blogLogin+"\">"+blogLogin+"</a></li>"+
			"<li>Username: "+inviteData.Email+"</li><li>Password: "+randomPassword+"</li></ul>"+
			"<p>Please log in and change your password immediately.</p>",
		"User invitation")

	res.Write([]byte("Ok"))
}
