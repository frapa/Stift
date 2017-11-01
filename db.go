package main

import (
	"database/sql"
	"os"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
)

const (
	dbVersion = "0.1.0"
)

var db *sqlx.DB

func init() {
	var err error

	if _, err = os.Stat("data.sqlite3"); os.IsNotExist(err) {
		// This means the database was not created yet.
		CreateEmptySchema()
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

	print(version)
	if version == dbVersion {

	}
}

type User struct {
	Id        sql.NullString
	Email     sql.NullString
	Name      sql.NullString
	Slug      sql.NullString
	Location  sql.NullString
	Biography sql.NullString
	Password  sql.NullString
	Salt      sql.NullString
	Tags      sql.NullString
}

type Post struct {
	Id             sql.NullString
	Title          sql.NullString
	Plaintext      sql.NullString
	Html           sql.NullString
	Featured_Image sql.NullString
	Visibility     sql.NullString
	Tags           sql.NullString
	Author         sql.NullInt64
	Type           sql.NullString
	Featured       sql.NullInt64
	Created_At     *time.Time
	Updated_At     *time.Time
	Published_At   *time.Time
	Code_Injection sql.NullString
	Custom_Excerpt sql.NullString
}

type Settings struct {
	Key   sql.NullString
	Value sql.NullString
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
		slug text,
		location text,
		biography text,
        password text,
        salt text,
        tags text
    );`)
	db.Exec(`CREATE TABLE Posts (
        id text PRIMARY KEY,
        title text,
        plaintext text,
        html text,
        featured_image text,
        visibility text,
        tags text,
        author integer,
        type text,
        featured integer,
        created_at datetime,
        updated_at datetime,
        published_at datetime,
        code_injection text,
        custom_excerpt text
    );`)
	db.Exec(`CREATE TABLE Settings (
        key text PRIMARY KEY,
		value text
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

	// Assume there is only one match
	rows.Next()

	colNum := len(strings.Split(cols, ","))
	values := make([]string, colNum)
	for i := 0; i < colNum; i++ {
		if err := rows.Scan(&values[i]); err != nil {
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

func getSetting(setting string) (string, error) {
	val, err := getColumnsWhere("Settings", "value", "key=?", setting)
	if err != nil {
		return "", err
	}
	return val[0], nil
}

func createSetting(setting string, value string) error {
	err := insertInto("Settings", "key, value", setting, value)
	if err != nil {
		return err
	}
	return nil
}
