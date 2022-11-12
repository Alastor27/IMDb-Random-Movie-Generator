// ==UserScript==
// @name         IMDb Random Movie Generator
// @version      0.3.3
// @description  Generate a random movie from IMDb watchlists.
// @author       Alastor
// @match        https://*.imdb.com/user/ur*/watchlist*
// @grant        none
// @downloadURL  https://github.com/Alastor27/IMDb-Random-Movie-Generator/raw/main/IMDbRandomMovieGenerator.tamper.js
// @updateURL    https://github.com/Alastor27/IMDb-Random-Movie-Generator/raw/main/IMDbRandomMovieGenerator.tamper.js
// ==/UserScript==

(function() {
  'use strict';

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
  
  function main() {
    // Internal functions
    function csvToArray(text) {
      let p = '',
        row = [''],
        ret = [row],
        i = 0,
        r = 0,
        s = !0,
        l;
      for (l of text) {
        if ('"' === l) {
          if (s && l === p) row[i] += l;
          s = !s;
        } else if (',' === l && s) l = row[++i] = '';
        else if ('\n' === l && s) {
          if ('\r' === p) row[i] = row[i].slice(0, -1);
          row = ret[++r] = [l = ''];
          i = 0;
        } else row[i] += l;
        p = l;
      }
      return ret;
    };
  
    // Get watchlist
    var watchlist_xmlhttp = new XMLHttpRequest();
    var watchlist_csv;
    var watchlist_length;
    var watchlist_url;
  
    if (document.getElementById("sidebar") == null) {
      console.info("Can't find sidebar element");
  
      return;
    }
    else if (document.getElementsByClassName("export")[0] == undefined) {
      document.getElementById("sidebar").getElementsByClassName("aux-content-widget-2")[0].insertAdjacentHTML("beforebegin",
        '<div class="aux-content-widget-2" id="imdb-random-movie" data-imdb-random-movie="section-container">\n\
          <h3 data-imdb-random-movie="section-title">Random movie</h3>\n\
          <div data-imdb-random-movie="warning-container">\n\
            <p data-imdb-random-movie="warning" class="blurb">Please, log in to use this function.</p>\n\
          </div>\n\
        </div>\n'
      );
  
      console.info("Can't find watchlist CSV");
  
      return;
    }
    else {
      watchlist_url = document.getElementsByClassName("export")[0].getElementsByTagName("a")[0].getAttribute("href");
    }
  
    watchlist_url = "https://www.imdb.com" + watchlist_url;
  
    watchlist_xmlhttp.onreadystatechange = function() {
      if (watchlist_xmlhttp.readyState == 4) {
        watchlist_csv = watchlist_xmlhttp.responseText.split("\n");
        watchlist_csv.shift();
        watchlist_csv.pop();
        watchlist_length = watchlist_csv.length;
      }
    };
    watchlist_xmlhttp.open("GET", watchlist_url, false);
    watchlist_xmlhttp.send(null);
  
    // Inject CSS
    document.head.insertAdjacentHTML("beforeend",
      '<style type="text/css" data-imdb-random-movie="stylesheet" name="IMDb Random Movie Generator">\n\
        #imdb-random-movie {\n\
          font-family: Verdana, Arial, sans-serif;\n\
        }\n\
        #imdb-random-movie h3[data-imdb-random-movie="button-container"] {\n\
          text-align: center;\n\
          margin: 10px 0 20px 0;\n\
        }\n\
        #imdb-random-movie div[data-imdb-random-movie="button-container"] {\n\
          text-align: center;\n\
          margin-bottom: 20px;\n\
        }\n\
        #imdb-random-movie input[data-imdb-random-movie="generate-button"] {\n\
          cursor: pointer;\n\
          color: #333;\n\
          background-color: #e3e2dd;\n\
          font: 14px Arial, sans-serif;\n\
          font-weight: normal;\n\
          border: 0px;\n\
          border-radius: 5px;\n\
          padding: 5px 30px;\n\
          transition: background-color 0.2s, box-shadow 0.2s;\n\
        }\n\
        #imdb-random-movie input[data-imdb-random-movie="generate-button"]:focus {\n\
          outline: 0;\n\
        }\n\
        #imdb-random-movie input[data-imdb-random-movie="generate-button"]:hover {\n\
          background-color: #F5C518;\n\
          box-shadow: #C3C3C3 0px 3px 5px;\n\
        }\n\
        #imdb-random-movie input[data-imdb-random-movie="generate-button"]:active {\n\
          background-color: #FFE71D;\n\
        }\n\
        #imdb-random-movie div[data-imdb-random-movie="movie-selected-container"] {\n\
          text-align: center;\n\
        }\n\
        #imdb-random-movie a[data-imdb-random-movie="movie-link"] {\n\
          color: #136CB2;\n\
          font-weight: normal;\n\
          font-size: 17px;\n\
        }\n\
        #imdb-random-movie a[data-imdb-random-movie="movie-link"]:hover {\n\
          color: #70579D;\n\
        }\n\
        #imdb-random-movie p[data-imdb-random-movie="movie-info"] {\n\
          margin-top: 10px;\n\
          margin-bottom: 6px;\n\
          color: #666;\n\
          font-size: 11px;\n\
        }\n\
        #imdb-random-movie p[data-imdb-random-movie="movie-info"] *+*::before {\n\
          color: #DDDDDD;\n\
          content: \' | \';\n\
        }\n\
        #imdb-random-movie img[data-imdb-random-movie="movie-poster"] {\n\
          width: 182px;\n\
          height: 268px;\n\
          margin-bottom: 10px;\n\
          transition: opacity 0.2s;\n\
        }\n\
        #imdb-random-movie span[data-imdb-random-movie="movie-info-star"] {\n\
          background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAAEhcmxxAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAF+SURBVHjaYvz//z8DHJyYp7ANAAAA//9i+P//PwPTiXkK/wEAAAD//2JgYGBgODdPRZSBgYEBAAAA//9iRFHIwMDAcHyuwg8GBgYGpv/7HVgYGP6zMzAwMAAAAAD//0JBpxcqmsHYjCeWqMj8//n7MbICRgbGS4wMDAwM////ZzwxT+EfIyPDvv//GQwskx8KAwAAAP//wrQRn/kMDAwMTDDGnz//D8EcDrF8rsLF/wz/9ZBVc7KwyzDCfP3//39PBgYGBgslRVZGxwN/mKCuMmdkZNjHwMDAwOCw/y8DAwMDQIRdRQw4MVd+0Ym58ouwyTH+/9/AdH7+EuE/TAxi/xh/izH8ZQz///9/OgMDAwMjI+NMBub/K5n+s75i+cfwyjAx5i0jAwMDw42N6rwf3vxc85/hvxtWUxkYdwmIsIdo+N/8zIjmlC3/GRi8URUzbLVIfuiDEbAn5qloMTAwGDExMkZZJj9ktEx+yMjEyBjFwMBgBJVjYGBgYAAMAHt3eB3BUP8eAAAAAElFTkSuQmCC);\n\
          height: 12px;\n\
          width: 12px;\n\
          margin-right: 2px;\n\
          background-repeat: no-repeat;\n\
          display: inline-block;\n\
        }\n\
        #imdb-random-movie span[data-imdb-random-movie="movie-info-release-date"] {\n\
          color: #C03B05;\n\
        }\n\
        #imdb-random-movie span[data-imdb-random-movie="movie-info-rating"] {\n\
          color: #333;\n\
          font-size: 13px;\n\
          display: inline-block;\n\
          vertical-align: text-bottom;\n\
        }\n\
        #imdb-random-movie p[data-imdb-random-movie="movie-info-summary"] {\n\
          text-align: justify;\n\
          margin-top: 20px;\n\
        }\n\
        #imdb-random-movie span[data-imdb-random-movie="movie-info-summary-label"] {\n\
          vertical-align: text-top;\n\
          line-height: 30px;\n\
          font-weight: bold;\n\
          margin-bottom: 5px;\n\
        }\n\
      </style>\n'
    );
  
    // Inject "Random Movie" section
    document.getElementById("sidebar").getElementsByClassName("aux-content-widget-2")[0].insertAdjacentHTML("beforebegin",
      '<div class="aux-content-widget-2" id="imdb-random-movie" data-imdb-random-movie="section-container">\n\
        <h3 data-imdb-random-movie="section-title">Random movie</h3>\n\
        <div data-imdb-random-movie="button-container">\n\
          <input data-imdb-random-movie="generate-button" type="button" onclick="javascript:void(0);" id="generate_movie" value="Roll the dice!">\n\
        </div>\n\
        <div data-imdb-random-movie="movie-selected-container" id="movie-selected">\n\
          <a data-imdb-random-movie="movie-link" href="#placeholder" target="_blank" style="display: none;">\n\
            <img data-imdb-random-movie="movie-poster" src="" alt="placeholder" title="placeholder" width="182px" height="268px" />\n\
            <br>\n\
            placeholder\n\
          </a>\n\
        </div>\n\
      </div>\n'
    );
  
    // Select a movie
    document.getElementById("generate_movie").addEventListener("click", function() {
  
      var watchlist_movie_id = Math.floor((watchlist_length + 1) * Math.random());
      watchlist_movie_id = (watchlist_movie_id >= watchlist_length) ? watchlist_length - 1 : watchlist_movie_id;
  
      var movie_info = csvToArray(watchlist_csv[watchlist_movie_id])[0];
  
      // Get title details
      var movie_title = movie_info[5];
      var movie_page_url = movie_info[6];
      var movie_year = movie_info[10];
      var movie_genre = movie_info[11];
      var movie_poster_url = "";
      var movie_runtime = (movie_info[9] ? Math.floor(movie_info[9] / 60) + "h&nbsp;" + (movie_info[9] % 60) + "m" : "?h&nbsp;??m");
      var movie_release_date = ((Date.now() < Date.parse(movie_info[13])) ? '<span data-imdb-random-movie="movie-info-release-date">release&nbsp;date:&nbsp;' + movie_info[13] + '</span>\n' : "");
      var movie_rating = (movie_info[8] ? movie_info[8] : "n/a");
      var movie_summary = "n/a";
      var movie_xmlhttp = new XMLHttpRequest();
      var parser = new DOMParser();
      var movie_page_html;
      var movie_selected_container;
  
      movie_xmlhttp.onreadystatechange = function() {
        if (movie_xmlhttp.readyState == 4) {
          movie_page_html = parser.parseFromString(movie_xmlhttp.responseText, "text/html");
          //movie_poster_url = movie_page_html.getElementsByClassName("poster")[0].getElementsByTagName("a")[0].getElementsByTagName("img")[0].getAttribute("src");
          movie_poster_url = movie_page_html.getElementsByTagName("img")[0].getAttribute("src");
          //movie_summary = movie_page_html.getElementsByClassName("summary_text")[0].innerHTML.trim();
          //movie_summary = movie_page_html.querySelectorAll('[class^=GenresAndPlot__TextContainer]')[2].textContent.trim();
          movie_summary = movie_page_html.querySelector('span[data-testid="plot-xl"]').textContent.trim();
        }
      };
      movie_xmlhttp.open("POST", movie_page_url, false);
      movie_xmlhttp.send(null);
  
      console.info("Selected movie: [" + watchlist_movie_id + "] " + movie_title + " (" + movie_year + ") [" + movie_page_url + "]");
      //console.log(movie_info); // DEBUG LINE
  
      movie_selected_container = document.getElementById("movie-selected");
      while (movie_selected_container.firstChild) {
        movie_selected_container.removeChild(movie_selected_container.firstChild);
      }
  
      document.getElementById("movie-selected").insertAdjacentHTML("afterbegin",
        '<a data-imdb-random-movie="movie-link" href="' + movie_page_url + '" target="_blank">\n\
          <img data-imdb-random-movie="movie-poster" src="' + movie_poster_url + '" alt="' + movie_title + '" title="' + movie_title + '" width="182px" height="268px" onload="this.style.opacity = 1;" style="opacity: 0;" />\n\
          <br>' +
          movie_title +
        '</a>\n\
        <p data-imdb-random-movie="movie-info">\n\
          <span data-imdb-random-movie="movie-info-year">' + movie_year + '</span>\n\
          <span data-imdb-random-movie="movie-info-runtime">' + movie_runtime + '</span>\n\
          <span data-imdb-random-movie="movie-info-genre">' + movie_genre + '</span>\n' +
          movie_release_date +
        '</p>\n\
        <span data-imdb-random-movie="movie-info-rating">\n\
          <span data-imdb-random-movie="movie-info-star"></span>' + movie_rating +
        '</span>\n\
        <p data-imdb-random-movie="movie-info-summary">\n\
          <span data-imdb-random-movie="movie-info-summary-label">Summary</span>\n\
          <br>\n' +
          movie_summary +
        '</p>\n'
       );
    });
  };
})();
