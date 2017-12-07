package main

import (
	"net/http"
	"strings"
	"time"
)

func Rss(res http.ResponseWriter, req *http.Request) {
	rss := `<?xml version="1.0"?><rss version="2.0"><channel>` +
		`<generator>AusDruck</generator>`

	// Title
	title, err := getSetting("BlogTitle")
	if err != nil {
		LogError(err.Error())
		http.Error(res, http.StatusText(500), http.StatusInternalServerError)
		return
	}
	rss += `<title>` + title + `</title>`

	// Description
	desc, err := getSetting("BlogSubtitle")
	if err != nil {
		LogError(err.Error())
		http.Error(res, http.StatusText(500), http.StatusInternalServerError)
		return
	}
	rss += `<description>` + desc + `</description>`

	// Website Url
	url, err := getSetting("BlogUrl")
	if err != nil {
		LogError(err.Error())
		http.Error(res, http.StatusText(500), http.StatusInternalServerError)
		return
	}
	rss += `<link>` + url + `</link>`

	// Posts
	posts, err := getAllPostsLimit(20)
	if err != nil {
		LogError(err.Error())
		http.Error(res, http.StatusText(500), http.StatusInternalServerError)
		return
	}
	for _, post := range posts {
		// description
		excerpt := ""
		if post.Custom_Excerpt == "" {
			if len(strings.Split(post.Html, "<p>")) > 1 {
				fromFirstParagraph := strings.Split(post.Html, "<p>")[1]
				firstParagraph := strings.Split(fromFirstParagraph, "</p>")[0]
				excerpt = firstParagraph
			} else {
				excerpt = post.Html
			}
		} else {
			excerpt = post.Custom_Excerpt
		}

		// categories
		categories := ""
		for _, tag := range post.Tags {
			categories += `<tag>` + tag.Name + `</tag>`
		}

		// image
		image := ""
		if post.Featured_Image != "" {
			image = `&lt;img src="` + url + `/media/` + post.Featured_Image + `" width="200" /&gt;&lt;br/&gt;`
		}

		// put together
		rss += `<item>` +
			`<title>` + post.Title + `</title>` +
			`<link>` + url + post.Href + `</link>` +
			`<description>` + image + excerpt + `</description>` +
			`<guid isPermaLink="true">` + url + post.Href + `</guid>` +
			`<pubDate>` + post.Published_At.Format(time.RFC1123) + `</pubDate>` +
			categories +
			`</item>`
	}

	rss += `</channel></rss>`

	res.Write([]byte(rss))
}
