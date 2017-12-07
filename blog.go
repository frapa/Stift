package main

import (
	"database/sql"
	"fmt"
	"html/template"
	"math"
	"net/http"
	"path/filepath"
	"reflect"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/dannyvankooten/grender"
	"github.com/gorilla/mux"
)

const Expiration = time.Hour

var gRender *grender.Grender
var wordSplitRegexp *regexp.Regexp

var searchesExpiry map[string]time.Time
var searches map[string]*SearchData

func init() {
	searchesExpiry = make(map[string]time.Time)
	searches = make(map[string]*SearchData)
}

func RenderTemplate(res http.ResponseWriter, status int, templateFile string, data interface{}) {
	initFrontend()
	gRender.HTML(res, status, templateFile, data)
}

func initFrontend() {
	templateFunctions := make(template.FuncMap)
	templateFunctions["echo"] = func(content interface{}) string {
		type_ := reflect.ValueOf(content).Type().Name()

		if type_ == "string" {
			return content.(string)
		} else if type_ == "NullString" {
			return content.(sql.NullString).String
		}

		return "" // I hate go when it is so stupid
	}
	templateFunctions["paginate"] = func(i int, n int, p int) bool {
		s := n * p
		e := n * (p + 1)
		return i >= s && i < e
	}
	templateFunctions["next_exist"] = func(posts interface{}, n int, p int) bool {
		l := reflect.ValueOf(posts).Len()
		t := l / n

		return p < t
	}
	templateFunctions["prev_href"] = func(p int) string {
		return "?page=" + strconv.Itoa(p-1)
	}
	templateFunctions["next_href"] = func(p int) string {
		return "?page=" + strconv.Itoa(p+1)
	}
	templateFunctions["plain"] = func(html interface{}) template.HTML {
		type_ := reflect.ValueOf(html).Type().Name()

		content := ""
		if type_ == "string" {
			content = html.(string)
		} else if type_ == "NullString" {
			content = html.(sql.NullString).String
		}

		return template.HTML(content)
	}
	templateFunctions["excerpt"] = func(post PubPost) string {
		if post.Custom_Excerpt == "" {
			if len(strings.Split(post.Html, "<p>")) > 1 {
				fromFirstParagraph := strings.Split(post.Html, "<p>")[1]
				firstParagraph := strings.Split(fromFirstParagraph, "</p>")[0]
				return firstParagraph
			} else {
				return post.Html
			}
		} else {
			return post.Custom_Excerpt
		}
	}
	templateFunctions["format"] = func(date time.Time, format string) string {
		return date.Format(format)
	}

	initThemeRoutes()

	themePath := filepath.Join("content", "themes", theme, "pages", "/*.html")

	gRender = grender.New(grender.Options{
		Charset:       "UTF-8",
		TemplatesGlob: themePath,
		PartialsGlob:  themePath,
		Funcs:         templateFunctions,
	})

	wordSplitRegexp = regexp.MustCompile("[^0-9A-Za-z]+")
}

type PubTag struct {
	Id          string
	Name        string
	Image       string
	Slug        string
	Description string
	LinkId      string
	Href        string
}

type PubAuthor struct {
	Id              string
	Email           string
	Name            string
	Slug            string
	Location        string
	Biography       string
	Profile_Picture string
	Tags            string
	Dark_Theme      int64
	LinkId          string
	Href            string
}

type PubPost struct {
	Id             string
	Title          string
	Plaintext      string
	Slug           string
	Html           string
	Visible        int64
	Page           int64
	Featured       int64
	Created_At     *time.Time
	Updated_At     *time.Time
	Published_At   *time.Time
	Code_Injection string
	Custom_Excerpt string
	Tags           []PubTag
	Authors        []PubAuthor
	Featured_Image string
	Href           string
}

type BaseWebsiteData struct {
	Title              string
	Subtitle           string
	SearchEnabled      bool
	SubscribersEnabled bool
	Pages              []PubPost
}

type HomeData struct {
	BaseWebsiteData
	Posts []PubPost
	Page  int
}

func FillBasicWebsiteData() BaseWebsiteData {
	var err error
	var data BaseWebsiteData

	// Blog metadata
	data.Title, err = getSetting("BlogTitle")
	if err != nil {
		LogInfo("No BlogTitle setting found.")
		LogError(err.Error())
		data.Title = ""
	}

	data.Subtitle, err = getSetting("BlogSubtitle")
	if err != nil {
		LogInfo("No BlogSubtitle setting found.")
		LogError(err.Error())
		data.Subtitle = ""
	}

	searchEnabled, err := getSetting("SearchEnabled")
	if err != nil {
		LogInfo("No SearchEnabled setting found.")
		LogError(err.Error())
		data.SearchEnabled = true
	}
	data.SearchEnabled = searchEnabled == "1"

	subscribersEnabled, err := getSetting("SubscribersEnabled")
	if err != nil {
		LogInfo("No SubscribersEnabled setting found.")
		LogError(err.Error())
		data.SubscribersEnabled = true
	}
	data.SubscribersEnabled = subscribersEnabled == "1"

	// Pages
	data.Pages, err = getAllPages()
	if err != nil {
		LogInfo("Pages could not be retrieved.")
		LogError(err.Error())
		data.Pages = make([]PubPost, 0)
	}

	return data
}

func getAllPostsBySql(sql string) ([]PubPost, error) {
	rows, err := db.Queryx(sql)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	posts := make([]PubPost, 0)
	for rows.Next() {
		post := new(PubPost)
		err := rows.StructScan(&post)
		if err != nil {
			return nil, err
		}

		slug := post.Slug
		var href string
		if post.Page == 1 {
			href = "/page/" + slug
		} else {
			date := post.Published_At
			href = date.Format("/2006/01/02/") + slug
		}
		post.Href = href

		// Featured image
		if post.Featured_Image != "" {
			pathSlice, err := getColumnsWhere("Media", "Path", "id=?", post.Featured_Image)
			if err != nil {
				return nil, err
			}
			if len(pathSlice) > 0 {
				post.Featured_Image = pathSlice[0]
			}
		}

		// Authors
		if post.Page == 0 {
			authors, err := getAuthors(post.Id)
			if err != nil {
				return nil, err
			}

			post.Authors = make([]PubAuthor, 0)
			for _, author := range authors {
				href := "/author/" + author.Slug.String
				post.Authors = append(post.Authors, PubAuthor{
					author.Id.String,
					author.Email.String,
					author.Name.String,
					author.Slug.String,
					author.Location.String,
					author.Biography.String,
					author.Profile_Picture.String,
					author.Tags.String,
					author.Dark_Theme.Int64,
					author.LinkId,
					href})
			}

			// Tags
			tags, err := getTags(post.Id)
			if err != nil {
				return nil, err
			}

			post.Tags = make([]PubTag, 0)
			for _, tag := range tags {
				href := "/tag/" + tag.Slug.String
				post.Tags = append(post.Tags, PubTag{
					tag.Id.String,
					tag.Name.String,
					tag.Image.String,
					tag.Slug.String,
					tag.Description.String,
					tag.LinkId,
					href})
			}
		}

		posts = append(posts, *post)
	}

	return posts, nil
}

func getAllPosts() ([]PubPost, error) {
	sql := `
		SELECT * FROM "Posts"
		WHERE "visible"=1
			AND "page" != 1
			AND "published_at" IS NOT NULL
			AND "published_at" < strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
		ORDER BY "published_at" DESC;`

	posts, err := getAllPostsBySql(sql)
	return posts, err
}

func getAllPostsLimit(limit int) ([]PubPost, error) {
	sql := `
		SELECT * FROM "Posts"
		WHERE "visible"=1
			AND "page" != 1
			AND "published_at" IS NOT NULL
			AND "published_at" < strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
		ORDER BY "published_at" DESC LIMIT ` + strconv.Itoa(limit) + `;`

	posts, err := getAllPostsBySql(sql)
	return posts, err
}

func getAllPostsOffsetLimit(offset int, limit int) ([]PubPost, error) {
	sql := `
		SELECT * FROM "Posts"
		WHERE "visible"=1
			AND "page" != 1
			AND "published_at" IS NOT NULL
			AND "published_at" < strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
		ORDER BY "published_at" DESC LIMIT ` + strconv.Itoa(limit) + `;`

	posts, err := getAllPostsBySql(sql)
	return posts, err
}

func getAllPages() ([]PubPost, error) {
	sql := `
		SELECT * FROM "Posts"
		WHERE "visible"=1
			AND "page" == 1
			AND "published_at" IS NOT NULL
			AND "published_at" < strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
		ORDER BY "published_at" DESC;`

	posts, err := getAllPostsBySql(sql)
	return posts, err
}

func Home(res http.ResponseWriter, req *http.Request) {
	page := req.URL.Query().Get("page")
	var numericPage int
	if page == "" {
		numericPage = 0
	} else {
		var err error
		numericPage, err = strconv.Atoi(page)
		if err != nil {
			http.Error(res, http.StatusText(404), http.StatusNotFound)
			return
		}
	}

	var err error

	data := new(HomeData)
	data.BaseWebsiteData = FillBasicWebsiteData()
	data.Page = numericPage

	// Posts
	data.Posts, err = getAllPosts()
	if err != nil {
		LogError(err.Error())
		http.Error(res, http.StatusText(500), http.StatusInternalServerError)
		return
	}

	RenderTemplate(res, http.StatusOK, "home.html", data)
}

type TagData struct {
	BaseWebsiteData
	PubTag
	Posts []PubPost
}

func getPostsFromTag(tagId string) ([]PubPost, error) {
	postsSql := `
		SELECT Posts.* FROM Post2Tags
		JOIN Posts ON Post2Tags.Post=Posts.Id
		WHERE Post2Tags.Tag=? AND Posts.visible=1
			AND Posts.published_at IS NOT NULL
			AND Posts.published_at < strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
		ORDER BY Posts.published_at ASC;`

	// Execute query
	rows, err := db.Queryx(postsSql, tagId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	posts := make([]PubPost, 0)

	for rows.Next() {
		rowData := new(PubPost)
		err := rows.StructScan(&rowData)
		if err != nil {
			return nil, err
		}

		slug := rowData.Slug
		var href string
		if rowData.Page == 1 {
			href = "/page/" + slug
		} else {
			date := rowData.Published_At
			href = date.Format("/2006/01/02/") + slug
		}
		rowData.Href = href

		posts = append(posts, *rowData)
	}

	return posts, nil
}

func TagPage(res http.ResponseWriter, req *http.Request) {
	initFrontend()
	vars := mux.Vars(req)
	slug := vars["slug"]

	var err error

	data := new(TagData)
	data.BaseWebsiteData = FillBasicWebsiteData()

	// Extract tag database
	sql := `SELECT * FROM "Tags" WHERE "slug"=? LIMIT 1;`

	rows, err := db.Queryx(sql, slug)
	if err != nil {
		LogError(err.Error())
		http.Error(res, http.StatusText(500), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	if rows.Next() {
		err = rows.StructScan(&data)
		if err != nil {
			LogError(err.Error())
			http.Error(res, http.StatusText(500), http.StatusInternalServerError)
			return
		}

		// Extract posts with this tag
		data.Posts, err = getPostsFromTag(data.Id)
		if err != nil {
			LogError(err.Error())
			http.Error(res, http.StatusText(500), http.StatusInternalServerError)
			return
		}
	} else {
		http.Error(res, http.StatusText(404), http.StatusNotFound)
		return
	}

	RenderTemplate(res, http.StatusOK, "tag.html", data)
}

type AuthorData struct {
	BaseWebsiteData
	PubAuthor
	Posts []PubPost
}

func getPostsFromAuthor(userId string) ([]PubPost, error) {
	postsSql := `
		SELECT Posts.* FROM Post2Users
		JOIN Posts ON Post2Users.Post=Posts.Id
		WHERE Post2Users.User=? AND Posts.visible=1
			AND "page" != 1
			AND Posts.published_at IS NOT NULL
			AND Posts.published_at < strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
		ORDER BY Posts.published_at ASC;`

	// Execute query
	rows, err := db.Queryx(postsSql, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	posts := make([]PubPost, 0)

	for rows.Next() {
		rowData := new(PubPost)
		err := rows.StructScan(&rowData)
		if err != nil {
			return nil, err
		}

		slug := rowData.Slug
		var href string
		if rowData.Page == 1 {
			href = "/page/" + slug
		} else {
			date := rowData.Published_At
			href = date.Format("/2006/01/02/") + slug
		}
		rowData.Href = href

		posts = append(posts, *rowData)
	}

	return posts, nil
}

func AuthorPage(res http.ResponseWriter, req *http.Request) {
	initFrontend()
	vars := mux.Vars(req)
	slug := vars["slug"]

	var err error

	data := new(AuthorData)
	data.BaseWebsiteData = FillBasicWebsiteData()

	// Extract tag database
	sql := `SELECT * FROM "Users" WHERE "slug"=? LIMIT 1;`

	// Unsafe is necessary because it allows reading into the struct
	// even if password and salt is missing. For security reasons these
	// fields should not be available to the theme.
	rows, err := db.Unsafe().Queryx(sql, slug)
	if err != nil {
		LogError(err.Error())
		http.Error(res, http.StatusText(500), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	if rows.Next() {
		err = rows.StructScan(&data)
		if err != nil {
			LogError(err.Error())
			http.Error(res, http.StatusText(500), http.StatusInternalServerError)
			return
		}

		// Extract posts with this tag
		data.Posts, err = getPostsFromAuthor(data.Id)
		if err != nil {
			LogError(err.Error())
			http.Error(res, http.StatusText(500), http.StatusInternalServerError)
			return
		}
	} else {
		http.Error(res, http.StatusText(404), http.StatusNotFound)
		return
	}

	RenderTemplate(res, http.StatusOK, "author.html", data)
}

type PostData struct {
	BaseWebsiteData
	Post PubPost
}

func getFullPostsBySlug(slug string) (PubPost, error) {
	sql := `
		SELECT * FROM "Posts"
		WHERE "visible"=1
			AND "slug"=?
			AND "published_at" IS NOT NULL
			AND "published_at" < strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
		ORDER BY "published_at" DESC;`

	rows, err := db.Queryx(sql, slug)
	if err != nil {
		return PubPost{}, err
	}
	defer rows.Close()

	rows.Next()
	var post PubPost
	err = rows.StructScan(&post)
	if err != nil {
		return PubPost{}, err
	}

	var href string
	if post.Page == 1 {
		href = "/page/" + slug
	} else {
		date := post.Published_At
		href = date.Format("/2006/01/02/") + slug
	}
	post.Href = href

	// Authors
	if post.Page == 0 {
		authors, err := getAuthors(post.Id)
		if err != nil {
			return PubPost{}, err
		}

		post.Authors = make([]PubAuthor, 0)
		for _, author := range authors {
			href := "/author/" + author.Slug.String
			post.Authors = append(post.Authors, PubAuthor{
				author.Id.String,
				author.Email.String,
				author.Name.String,
				author.Slug.String,
				author.Location.String,
				author.Biography.String,
				author.Profile_Picture.String,
				author.Tags.String,
				author.Dark_Theme.Int64,
				author.LinkId,
				href})
		}

		// Tags
		tags, err := getTags(post.Id)
		if err != nil {
			return PubPost{}, err
		}

		post.Tags = make([]PubTag, 0)
		for _, tag := range tags {
			href := "/tag/" + tag.Slug.String
			post.Tags = append(post.Tags, PubTag{
				tag.Id.String,
				tag.Name.String,
				tag.Image.String,
				tag.Slug.String,
				tag.Description.String,
				tag.LinkId,
				href})
		}
	}

	return post, nil
}

func PostPage(res http.ResponseWriter, req *http.Request) {
	initFrontend()
	vars := mux.Vars(req)
	slug := vars["slug"]

	var err error

	data := new(PostData)
	data.BaseWebsiteData = FillBasicWebsiteData()

	// Extract tag database
	data.Post, err = getFullPostsBySlug(slug)
	if err != nil {
		LogError(err.Error())
		http.Error(res, http.StatusText(404), http.StatusNotFound)
		return
	}

	if data.Post.Page == 1 {
		http.Error(res, http.StatusText(404), http.StatusNotFound)
		return
	}

	RenderTemplate(res, http.StatusOK, "post.html", data)
}

func PagePage(res http.ResponseWriter, req *http.Request) {
	initFrontend()
	vars := mux.Vars(req)
	slug := vars["slug"]

	var err error

	data := new(PostData)
	data.BaseWebsiteData = FillBasicWebsiteData()

	// Extract tag database
	data.Post, err = getFullPostsBySlug(slug)
	if err != nil {
		LogError(err.Error())
		http.Error(res, http.StatusText(404), http.StatusNotFound)
		return
	}

	if data.Post.Page == 0 {
		http.Error(res, http.StatusText(404), http.StatusNotFound)
		return
	}

	RenderTemplate(res, http.StatusOK, "page.html", data)
}

type SearchResult struct {
	Post  PubPost
	Score float64
}

type SearchData struct {
	BaseWebsiteData
	Results      []SearchResult
	ResultNumber int
	SearchTerms  string
	Page         int
}

// Relevance taken from https://www.elastic.co/guide/en/elasticsearch/guide/current/scoring-theory.html#tf
func calculateRelevance(term string, post map[int][]string, idf float64) float64 {
	// Count occurences
	titleCount := float64(CountSlice(term, post[TITLE]))
	htmlCount := float64(CountSlice(term, post[TITLE]))
	excerptCount := float64(CountSlice(term, post[TITLE]))
	titleFreq := math.Sqrt(titleCount)
	htmlFreq := math.Sqrt(htmlCount)
	excerptFreq := math.Sqrt(excerptCount)

	// Field-length norm
	titleLen := float64(len(post[TITLE]))
	htmlLen := float64(len(post[HTML]))
	excerptLen := float64(len(post[EXCERPT]))
	titleNorm := 1 / math.Sqrt(titleLen+1)
	htmlNorm := 1 / math.Sqrt(htmlLen+1)
	excerptNorm := 1 / math.Sqrt(excerptLen+1)

	score := (titleFreq*titleNorm + htmlFreq*htmlNorm + excerptFreq*excerptNorm) * idf

	return score
}

func HighlightTerm(str string, term string) string {
	repRe, err := regexp.Compile("(?i)([^0-9A-Za-z]|^)(" + term + ")([^0-9A-Za-z]|$)")
	if err != nil {
		LogInfo(err.Error())
		return strings.Replace(str, term, "<strong>"+term+"</strong>", -1)
	}

	return repRe.ReplaceAllString(str, "$1<strong>$2</strong>$3")
}

func InSlice(elem string, slice []string) bool {
	for _, val := range slice {
		if val == elem {
			return true
		}
	}

	return false
}

func CountSlice(elem string, slice []string) int {
	count := 0

	for _, val := range slice {
		if val == elem {
			count += 1
		}
	}

	return count
}

const (
	TITLE   = 0
	HTML    = 1
	EXCERPT = 2
)

func Search(res http.ResponseWriter, req *http.Request) {
	t := time.Now()
	rawTerms := req.URL.Query().Get("terms")
	terms := wordSplitRegexp.Split(strings.ToLower(rawTerms), -1)

	if len(terms) > 10 {
		LogInfo("Too many search terms. Aborting.")
		http.Error(res, http.StatusText(500), http.StatusInternalServerError)
		return
	}

	sort.Slice(terms, func(i, j int) bool {
		return terms[i] > terms[j]
	})
	searchKey := strings.Join(terms, "-")

	if searchData, ok := searches[searchKey]; ok {
		expiration := searchesExpiry[searchKey]
		if expiration.Before(time.Now()) {
			delete(searches, searchKey)
			delete(searchesExpiry, searchKey)
		} else {
			RenderTemplate(res, http.StatusOK, "search.html", searchData)
			fmt.Println(time.Now().Sub(t))
			return
		}
	}

	var page int
	var err error
	pageStr := req.URL.Query().Get("page")

	if pageStr != "" {
		page, err = strconv.Atoi(pageStr)
		if err != nil {
			page = 0
		}
	} else {
		page = 0
	}

	data := new(SearchData)
	data.BaseWebsiteData = FillBasicWebsiteData()
	data.SearchTerms = rawTerms
	data.Page = page

	// Search is limited to posts (and pages) for simplicity for now
	// I think 99.9% of the user would want to search them.
	posts, err := getAllPosts()
	if err != nil {
		LogError(err.Error())
		http.Error(res, http.StatusText(500), http.StatusInternalServerError)
		return
	}

	tockenizedPosts := make(map[int]map[int][]string)
	for i, post := range posts {
		tockenizedPosts[i] = make(map[int][]string)
		tockenizedPosts[i][TITLE] = wordSplitRegexp.Split(strings.ToLower(post.Title), -1)
		tockenizedPosts[i][HTML] = wordSplitRegexp.Split(strings.ToLower(post.Html), -1)
		tockenizedPosts[i][EXCERPT] = wordSplitRegexp.Split(strings.ToLower(post.Custom_Excerpt), -1)
	}

	totDoc := len(posts)
	scores := make([]float64, len(posts))
	for _, term := range terms {
		if term == "" {
			continue
		}

		termDoc := 0
		for i := range posts {
			if InSlice(term, tockenizedPosts[i][TITLE]) {
				termDoc += 1
			}
			if InSlice(term, tockenizedPosts[i][HTML]) {
				termDoc += 1
			}
			if InSlice(term, tockenizedPosts[i][EXCERPT]) {
				termDoc += 1
			}
		}

		idf := 1 + math.Log(float64(totDoc)/(float64(termDoc)+1))

		for pi := range posts {
			relevance := calculateRelevance(term, tockenizedPosts[pi], idf)
			scores[pi] += relevance
		}
	}

	data.Results = make([]SearchResult, 0)
	for i, post := range posts {
		score := scores[i]
		if score != 0 {
			var result SearchResult
			result.Post = post
			result.Score = score
			data.Results = append(data.Results, result)
		}
	}

	sort.Slice(data.Results, func(i, j int) bool {
		return data.Results[i].Score > data.Results[j].Score
	})

	data.ResultNumber = len(data.Results)

	// highlight results
	for i := range data.Results {
		for _, term := range terms {
			data.Results[i].Post.Title = HighlightTerm(
				data.Results[i].Post.Title, term)
			data.Results[i].Post.Html = HighlightTerm(
				data.Results[i].Post.Html, term)
			data.Results[i].Post.Custom_Excerpt = HighlightTerm(
				data.Results[i].Post.Custom_Excerpt, term)
		}
	}

	searchesExpiry[searchKey] = time.Now().Add(Expiration)
	searches[searchKey] = data

	RenderTemplate(res, http.StatusOK, "search.html", data)
	fmt.Println(time.Now().Sub(t))
}
