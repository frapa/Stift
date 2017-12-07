package main

import (
	"database/sql"
	"os"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
	"github.com/rs/xid"
)

const (
	dbVersion = "0.1.0"
)

var justCreated bool
var db *sqlx.DB

func init() {
	var err error

	if _, err = os.Stat("data.sqlite3"); os.IsNotExist(err) {
		// This means the database was not created yet.
		CreateEmptySchema()
		createSetting("DbVersion", dbVersion)
		justCreated = true
	}

	db, err = sqlx.Open("sqlite3", "data.sqlite3")
	if err != nil {
		panic(err)
	}

	// Execute migrations if the schema changes
	version, err := getSetting("DbVersion")
	if err != nil {
		LogError(err.Error())
		return
	}

	println(version)
	if version == dbVersion {

	}
}

type User struct {
	Id              sql.NullString
	Email           sql.NullString
	Name            sql.NullString
	Slug            sql.NullString
	Location        sql.NullString
	Biography       sql.NullString
	Profile_Picture sql.NullString
	Password        sql.NullString
	Salt            sql.NullString
	Tags            sql.NullString
	Dark_Theme      sql.NullInt64
}

type Post struct {
	Id             sql.NullString
	Title          sql.NullString
	Plaintext      sql.NullString
	Slug           sql.NullString
	Html           sql.NullString
	Featured_Image sql.NullString
	Visible        sql.NullInt64
	Page           sql.NullInt64
	Featured       sql.NullInt64
	Created_At     *time.Time
	Updated_At     *time.Time
	Published_At   *time.Time
	Code_Injection sql.NullString
	Custom_Excerpt sql.NullString
}

type Settings struct {
	Id    sql.NullString
	Key   sql.NullString
	Value sql.NullString
}

type Tag struct {
	Id          sql.NullString
	Name        sql.NullString
	Image       sql.NullString
	Slug        sql.NullString
	Description sql.NullString
}

type Subscriber struct {
	Id    sql.NullString
	Email sql.NullString
	Date  *time.Time
}

type Theme struct {
	Id   sql.NullString
	Name sql.NullString
}

type Media struct {
	Id          sql.NullString
	Path        sql.NullString
	Size        sql.NullInt64
	Width       sql.NullInt64
	Height      sql.NullInt64
	Uploaded_At *time.Time
}

type Post2Users struct {
	Id   sql.NullString
	Post sql.NullString
	User sql.NullString
}

type Post2Tags struct {
	Id   sql.NullString
	Post sql.NullString
	Tag  sql.NullString
}

func CreateEmptySchema() {
	var err error

	db, err = sqlx.Open("sqlite3", "data.sqlite3")
	if err != nil {
		panic(err)
	}

	db.Exec("BEGIN TRANSACTION;")
	db.Exec(`CREATE TABLE Users (
		id text PRIMARY KEY,
        email text,
		name text,
		slug text UNIQUE,
		location text,
		biography text,
		profile_picture text,
        password text,
        salt text,
        tags text,
		dark_theme integer
    );`)
	db.Exec(`CREATE TABLE Posts (
        id text PRIMARY KEY,
        title text,
        plaintext text,
        html text,
		slug text UNIQUE,
        featured_image text,
        visible integer,
        page integer,
        featured integer,
        created_at datetime,
        updated_at datetime,
        published_at datetime,
        code_injection text,
        custom_excerpt text
    );`)
	db.Exec(`CREATE TABLE Settings (
        id text PRIMARY KEY,
        key text,
		value text
    );`)
	db.Exec(`CREATE TABLE Tags (
        id text PRIMARY KEY,
        name text,
		slug text UNIQUE,
		image text,
		description text
    );`)
	db.Exec(`CREATE TABLE Subscribers (
        id text PRIMARY KEY,
        email text,
		date datetime
    );`)
	db.Exec(`CREATE TABLE Themes (
        id text PRIMARY KEY,
		name text
    );`)
	db.Exec(`CREATE TABLE Media (
        id text PRIMARY KEY,
		path text,
		size integer,
		width integer,
		height integer,
		uploaded_at datetime
    );`)
	db.Exec(`CREATE TABLE Outgoing_Emails (
        id text PRIMARY KEY,
		from_address text,
		to_address text,
		subject text,
		content text,
		reason text,
		date datetime
    );`)

	// Relations
	db.Exec(`CREATE TABLE Post2Tags (
        id text PRIMARY KEY,
        post text,
		tag text
    );`)
	db.Exec(`CREATE TABLE Post2Users (
        id text PRIMARY KEY,
        post text,
		user text
    );`)

	db.Exec("END TRANSACTION;")
}

// Unsafe function, use only with validated data
// Only works when there is one single match (returns first otherwise)
func getColumnsWhere(tab string, cols string, where string, args ...interface{}) ([]string, error) {
	sql := "SELECT " + cols + " FROM " +
		tab + " WHERE " + where + ";"

	rows, err := db.Query(sql, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	colNum := len(strings.Split(cols, ","))
	values := make([]string, colNum)

	// Assume there is only one match
	if rows.Next() {
		ints := make([]interface{}, colNum)
		for i := range values {
			ints[i] = &values[i]
		}

		if err := rows.Scan(ints...); err != nil {
			return nil, err
		}
	}

	return values, nil
}

// Unsafe function, use only with validated data
func insertInto(tab string, cols string, values ...interface{}) error {
	colNum := len(strings.Split(cols, ","))
	questions := strings.Repeat("?,", colNum)
	sql := "INSERT INTO " + tab + " (" + cols + ") VALUES (" +
		questions[:len(questions)-1] + ");"

	_, err := db.Exec(sql, values...)
	if err != nil {
		return err
	}

	return nil
}

// Unsafe function, use only with validated data
func updateWhere(tab string, cols string, where string, values ...interface{}) error {
	splitCols := strings.Split(cols, ",")
	sqlCols := strings.Join(splitCols, "=?, ") + "=?"
	sql := "UPDATE " + tab + " SET " + sqlCols + " WHERE " + where + ";"

	_, err := db.Exec(sql, values...)
	if err != nil {
		return err
	}

	return nil
}

func getSetting(setting string) (string, error) {
	val, err := getColumnsWhere("Settings", "value", "key=?", setting)
	if err != nil {
		return "", err
	}
	return val[0], nil
}

func createSetting(setting string, value string) error {
	err := insertInto("Settings", "id, key, value", xid.New().String(), setting, value)
	if err != nil {
		return err
	}
	return nil
}
